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
  baseEmissive: THREE.Color
  baseEmissiveIntensity: number
  baseRoughness: number
  baseMetalness: number
}

const TINT = {
  vessels: new THREE.Color('#c23b3b'),
  fat: new THREE.Color('#c4a35a'),
  skin: new THREE.Color('#c4a18a'),
  nerve: new THREE.Color('#e6d84a'),
  select: new THREE.Color('#3ecfff'),
  hover: new THREE.Color('#75d18c'),
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

    // Keep atlas paint: each bone/muscle keeps its own authored color
    packs.push({
      mesh,
      type: meshType(mesh),
      mat,
      baseColor: mat.color.clone(),
      baseEmissive: mat.emissive.clone(),
      baseEmissiveIntensity: mat.emissiveIntensity,
      baseRoughness: mat.roughness,
      baseMetalness: mat.metalness,
    })
  })
  return packs
}

function restoreBase(p: MeshPack) {
  p.mat.color.copy(p.baseColor)
  p.mat.emissive.copy(p.baseEmissive)
  p.mat.emissiveIntensity = p.baseEmissiveIntensity
  p.mat.roughness = p.baseRoughness
  p.mat.metalness = p.baseMetalness
  p.mat.wireframe = false
  p.mat.transparent = true
}

/**
 * Layer = visibility + light tint. Never flatten every mesh to one color
 * (that killed muscle-group identity from the Z-Anatomy GLB).
 */
function applyLayer(
  packs: MeshPack[],
  layer: AnatomyLayer,
  selectedName: string | null,
  hoveredName: string | null,
) {
  for (const p of packs) {
    const { mesh, type, mat } = p
    restoreBase(p)

    if (type === 'muscle') {
      const show =
        layer === 'skin' ||
        layer === 'muscles' ||
        layer === 'vessels' ||
        layer === 'visceral_fat' ||
        layer === 'organs'
      mesh.visible = show
      if (!show) continue

      if (layer === 'muscles') {
        mat.opacity = 1
        mat.depthWrite = true
      } else if (layer === 'vessels') {
        // Keep group hues, pull toward vascular red
        mat.color.lerp(TINT.vessels, 0.55)
        mat.emissive.copy(TINT.vessels)
        mat.emissiveIntensity = 0.22
        mat.opacity = 0.85
        mat.depthWrite = true
      } else if (layer === 'visceral_fat') {
        mat.color.lerp(TINT.fat, 0.5)
        mat.opacity = 0.55
        mat.depthWrite = false
      } else if (layer === 'skin') {
        mat.color.lerp(TINT.skin, 0.35)
        mat.opacity = 0.28
        mat.depthWrite = false
      } else if (layer === 'organs') {
        mat.opacity = 0.2
        mat.depthWrite = false
      }
    } else if (type === 'bone') {
      const show = layer === 'skeleton' || layer === 'skin' || layer === 'nerves'
      mesh.visible = show
      if (!show) continue

      if (layer === 'skeleton') {
        mat.opacity = 1
        mat.depthWrite = true
      } else if (layer === 'nerves') {
        mat.color.lerp(TINT.nerve, 0.45)
        mat.emissive.copy(TINT.nerve)
        mat.emissiveIntensity = 0.2
        mat.opacity = 0.8
        mat.depthWrite = true
      } else if (layer === 'skin') {
        mat.opacity = 0.14
        mat.depthWrite = false
      }
    } else {
      mesh.visible = layer === 'organs' || layer === 'skin'
      mat.opacity = layer === 'organs' ? 0.55 : 0.3
      mat.depthWrite = false
    }

    if (selectedName && mesh.name === selectedName && mesh.visible) {
      mat.emissive.copy(TINT.select)
      mat.emissiveIntensity = 0.65
      mat.opacity = 1
      mat.depthWrite = true
    } else if (hoveredName && mesh.name === hoveredName && mesh.visible) {
      mat.emissive.copy(TINT.hover)
      mat.emissiveIntensity = 0.35
    }

    mat.needsUpdate = true
  }
}

function AnatomyModel({
  layer,
  selectedName,
  onSelect,
  onHover,
}: {
  layer: AnatomyLayer
  selectedName: string | null
  onSelect: (name: string, type: string, label: string) => void
  onHover: (name: string | null) => void
}) {
  const { scene } = useGLTF('/models/body.glb', true)
  const invalidate = useThree((s) => s.invalidate)
  const packsRef = useRef<MeshPack[] | null>(null)
  const hoveredRef = useRef<string | null>(null)

  const root = useMemo(() => {
    const clone = scene.clone(true)
    packsRef.current = buildPacks(clone)
    clone.scale.setScalar(1)
    clone.rotation.set(0, 0, 0)
    clone.position.set(0, -0.05, 0)
    return clone
  }, [scene])

  useLayoutEffect(() => {
    if (!packsRef.current) return
    applyLayer(packsRef.current, layer, selectedName, hoveredRef.current)
    invalidate()
  }, [root, layer, selectedName, invalidate])

  const paintHover = (name: string | null) => {
    hoveredRef.current = name
    onHover(name)
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
      onPointerMissed={() => {
        paintHover(null)
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const obj = e.object
        if (!(obj as THREE.Mesh).isMesh) return
        if (hoveredRef.current === obj.name) return
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[2.5, 4, 2]} intensity={1.3} />
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
          onHover={() => {
            /* hover paint handled inside model */
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
      <ContactShadows position={[0, -0.02, 0]} opacity={0.28} scale={4} blur={2} frames={1} />
      <OrbitControls
        makeDefault
        target={orbitTarget}
        minDistance={1.0}
        maxDistance={4.8}
        maxPolarAngle={Math.PI * 0.85}
        enablePan
        screenSpacePanning
        panSpeed={0.85}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  )
}
