import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Billboard,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { JOINTS, type AnatomyLayer, type JointCallout } from './bodyMetrics'

export type { AnatomyLayer, JointCallout } from './bodyMetrics'
export { JOINTS } from './bodyMetrics'
export {
  estimateBodyFatPct,
  visceralFatScore,
  healthScore,
  useWebGLOk,
} from './bodyMetrics'

function meshType(obj: THREE.Object3D): string {
  const t = (obj.userData?.type as string | undefined)?.toLowerCase()
  if (t) return t
  const n = obj.name.toLowerCase()
  if (n.includes('bone') || n.includes('skeleton') || n.includes('vertebra') || n.includes('skull')) {
    return 'bone'
  }
  if (n.includes('muscle') || n.includes('muscul')) return 'muscle'
  return 'other'
}

function prettyName(mesh: THREE.Object3D): string {
  const raw = (mesh.name || mesh.parent?.name || 'Structure').trim()
  return raw.replace(/\.(l|r)$/i, (m) => (m.toLowerCase() === '.l' ? ' (L)' : ' (R)'))
}

type MeshPack = {
  mesh: THREE.Mesh
  type: string
  mat: THREE.MeshStandardMaterial
  baseColor: THREE.Color
  baseRoughness: number
  baseMetalness: number
}

const C = {
  vessels: new THREE.Color('#c23b3b'),
  vesselsEm: new THREE.Color('#7a1010'),
  fat: new THREE.Color('#c4a35a'),
  muscle: new THREE.Color('#b04a4a'),
  skin: new THREE.Color('#c4a18a'),
  bone: new THREE.Color('#e8e2d6'),
  boneEm: new THREE.Color('#1a3040'),
  nerve: new THREE.Color('#e6d84a'),
  nerveEm: new THREE.Color('#8a7a10'),
  /** Pass I cyan highlight */
  select: new THREE.Color('#3ecfff'),
  hover: new THREE.Color('#5ce1ff'),
}

function buildPacks(root: THREE.Object3D): MeshPack[] {
  const packs: MeshPack[] = []
  root.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return
    const mesh = o as THREE.Mesh
    mesh.castShadow = false
    mesh.receiveShadow = false
    mesh.frustumCulled = true

    let mat: THREE.MeshStandardMaterial
    if (Array.isArray(mesh.material)) {
      const first = mesh.material[0]
      mat =
        first && (first as THREE.MeshStandardMaterial).isMeshStandardMaterial
          ? (first as THREE.MeshStandardMaterial).clone()
          : new THREE.MeshStandardMaterial({ color: '#888' })
      mesh.material = mat
    } else if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
      mat = (mesh.material as THREE.MeshStandardMaterial).clone()
      mesh.material = mat
    } else {
      mat = new THREE.MeshStandardMaterial({ color: '#888' })
      mesh.material = mat
    }

    mat.transparent = true
    packs.push({
      mesh,
      type: meshType(mesh),
      mat,
      baseColor: mat.color.clone(),
      baseRoughness: mat.roughness,
      baseMetalness: mat.metalness,
    })
  })
  return packs
}

/**
 * Pass I style: glass/transparent body by default; hover/click → cyan highlight.
 * Base hue kept per mesh so groups stay readable under tint.
 */
function applyLayer(
  packs: MeshPack[],
  layer: AnatomyLayer,
  selectedName: string | null,
  hoveredName: string | null,
) {
  for (const p of packs) {
    const { mesh, type, mat } = p

    mat.color.copy(p.baseColor)
    mat.emissive.setHex(0x000000)
    mat.emissiveIntensity = 0
    mat.roughness = Math.min(0.9, p.baseRoughness + 0.08)
    mat.metalness = p.baseMetalness
    mat.transparent = true
    mat.wireframe = false
    mat.depthWrite = false

    if (type === 'muscle') {
      mesh.visible =
        layer === 'skin' ||
        layer === 'muscles' ||
        layer === 'vessels' ||
        layer === 'visceral_fat' ||
        layer === 'organs'

      if (mesh.visible) {
        if (layer === 'vessels') {
          mat.color.lerp(C.vessels, 0.72)
          mat.emissive.copy(C.vesselsEm)
          mat.emissiveIntensity = 0.22
          mat.opacity = 0.42
        } else if (layer === 'visceral_fat') {
          mat.color.lerp(C.fat, 0.65)
          mat.opacity = 0.3
        } else if (layer === 'muscles') {
          mat.color.lerp(C.muscle, 0.4)
          mat.opacity = 0.48
        } else if (layer === 'skin') {
          mat.color.lerp(C.skin, 0.45)
          mat.opacity = 0.16
        } else if (layer === 'organs') {
          mat.opacity = 0.12
        }
      }
    } else if (type === 'bone') {
      mesh.visible = layer === 'skeleton' || layer === 'skin' || layer === 'nerves'

      if (mesh.visible) {
        if (layer === 'skeleton') {
          mat.color.lerp(C.bone, 0.3)
          mat.emissive.copy(C.boneEm)
          mat.emissiveIntensity = 0.05
          mat.opacity = 0.55
        } else if (layer === 'nerves') {
          mat.color.lerp(C.nerve, 0.55)
          mat.emissive.copy(C.nerveEm)
          mat.emissiveIntensity = 0.2
          mat.opacity = 0.48
        } else if (layer === 'skin') {
          mat.color.lerp(C.bone, 0.25)
          mat.opacity = 0.09
        }
      }
    } else {
      mesh.visible = layer === 'organs' || layer === 'skin'
      mat.opacity = layer === 'organs' ? 0.32 : 0.16
    }

    // Pass I highlight — solid cyan pop on glass body
    if (mesh.visible && selectedName && mesh.name === selectedName) {
      mat.emissive.copy(C.select)
      mat.emissiveIntensity = 0.9
      mat.opacity = 1
      mat.depthWrite = true
    } else if (mesh.visible && hoveredName && mesh.name === hoveredName) {
      mat.emissive.copy(C.hover)
      mat.emissiveIntensity = 0.75
      mat.opacity = 0.95
      mat.depthWrite = true
    }

    mat.needsUpdate = true
  }
}

function AnatomyModel({
  layer,
  selectedName,
  onSelect,
}: {
  layer: AnatomyLayer
  selectedName: string | null
  onSelect: (name: string, type: string, label: string) => void
}) {
  const { scene } = useGLTF('/models/body.glb', true)
  const invalidate = useThree((s) => s.invalidate)
  const packsRef = useRef<MeshPack[] | null>(null)
  const hoveredRef = useRef<string | null>(null)

  const root = useMemo(() => {
    const clone = scene.clone(true)
    packsRef.current = buildPacks(clone)
    clone.position.set(0, -0.05, 0)
    return clone
  }, [scene])

  useLayoutEffect(() => {
    if (!packsRef.current) return
    applyLayer(packsRef.current, layer, selectedName, hoveredRef.current)
    invalidate()
  }, [root, layer, selectedName, invalidate])

  const paintHover = (name: string | null) => {
    if (hoveredRef.current === name) return
    hoveredRef.current = name
    if (!packsRef.current) return
    applyLayer(packsRef.current, layer, selectedName, name)
    invalidate()
  }

  return (
    <primitive
      object={root}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        const obj = e.object
        if (!(obj as THREE.Mesh).isMesh) return
        const label = prettyName(obj)
        onSelect(obj.name || label, meshType(obj), label)
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const obj = e.object
        if (!(obj as THREE.Mesh).isMesh) return
        paintHover(obj.name)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        paintHover(null)
        document.body.style.cursor = 'auto'
      }}
    />
  )
}

function JointMarker({
  joint,
  active,
  onClick,
}: {
  joint: JointCallout
  active: boolean
  onClick: () => void
}) {
  return (
    <Billboard position={joint.position} follow>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <ringGeometry args={[0.016, 0.024, 20]} />
        <meshBasicMaterial
          color={active ? '#75d18c' : '#3a8f55'}
          transparent
          opacity={active ? 1 : 0.75}
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[0.007, 12]} />
        <meshBasicMaterial
          color={active ? '#75d18c' : '#9ad4aa'}
          transparent
          opacity={0.95}
          depthTest={false}
        />
      </mesh>
    </Billboard>
  )
}

useGLTF.preload('/models/body.glb', true)

export function AnatomyCanvas({
  layer,
  showJoints,
  activeJointId,
  onPick,
  onJointSelect,
}: {
  layer: AnatomyLayer
  showJoints?: boolean
  activeJointId?: string | null
  onPick: (name: string, type: string, label?: string) => void
  onJointSelect?: (id: string) => void
}) {
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const orbitTarget = useMemo((): [number, number, number] => {
    if (showJoints && activeJointId) {
      const j = JOINTS.find((x) => x.id === activeJointId)
      if (j) return j.position
    }
    return [0, 0.85, 0]
  }, [showJoints, activeJointId])

  return (
    <Canvas
      camera={{ position: [0.6, 1.1, 2.4], fov: 38, near: 0.01, far: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#03090b', 0)
      }}
    >
      <color attach="background" args={['#03090b']} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[2.5, 4, 2]} intensity={1.25} />
      <directionalLight position={[-2, 1, -1]} intensity={0.4} color="#5ce1ff" />
      <Suspense
        fallback={
          <Html center>
            <div className="med-loading">Loading anatomy…</div>
          </Html>
        }
      >
        <AnatomyModel
          layer={layer}
          selectedName={selectedName}
          onSelect={(name, type, label) => {
            setSelectedName(name)
            onPick(name, type, label)
          }}
        />
        <Environment preset="city" />
      </Suspense>
      {showJoints &&
        JOINTS.map((j) => (
          <JointMarker
            key={j.id}
            joint={j}
            active={activeJointId === j.id}
            onClick={() => onJointSelect?.(j.id)}
          />
        ))}
      <ContactShadows position={[0, -0.02, 0]} opacity={0.25} scale={4} blur={2} frames={1} />
      <OrbitControls
        makeDefault
        target={orbitTarget}
        minDistance={1.0}
        maxDistance={4.8}
        maxPolarAngle={Math.PI * 0.85}
        enablePan
        screenSpacePanning
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
