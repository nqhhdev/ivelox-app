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

type MeshPack = {
  mesh: THREE.Mesh
  type: string
  mat: THREE.MeshStandardMaterial
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
    mat.metalness = 0.05
    mat.roughness = 0.55
    packs.push({ mesh, type: meshType(mesh), mat })
  })
  return packs
}

/**
 * Pass 1 layer look: exclusive systems, high contrast, no muddy ghosts.
 * Muscle ≠ bone on the same focus mode (except skin peek).
 */
function applyLayerPass1(packs: MeshPack[], layer: AnatomyLayer, selectedName: string | null) {
  for (const { mesh, type, mat } of packs) {
    const selected = selectedName != null && mesh.name === selectedName

    mat.transparent = true
    mat.wireframe = false
    mat.depthWrite = layer !== 'skin'
    mat.emissive.setHex(0x000000)
    mat.emissiveIntensity = 0

    if (selected) {
      mesh.visible = true
      mat.emissive.set('#3ecfff')
      mat.emissiveIntensity = 0.55
      mat.opacity = 1
      mat.needsUpdate = true
      continue
    }

    if (type === 'muscle') {
      mesh.visible =
        layer === 'skin' ||
        layer === 'muscles' ||
        layer === 'vessels' ||
        layer === 'visceral_fat' ||
        layer === 'organs'

      if (layer === 'vessels') {
        mat.color.set('#c23b3b')
        mat.emissive.set('#7a1010')
        mat.emissiveIntensity = 0.4
        mat.opacity = 0.55
        mat.depthWrite = false
      } else if (layer === 'visceral_fat') {
        mat.color.set('#c4a35a')
        mat.opacity = 0.35
        mat.depthWrite = false
      } else if (layer === 'muscles') {
        mat.color.set('#b04a4a')
        mat.opacity = 0.92
        mat.depthWrite = true
      } else if (layer === 'skin') {
        mat.color.set('#c4a18a')
        mat.opacity = 0.22
        mat.depthWrite = false
      } else if (layer === 'organs') {
        mat.color.set('#b04a4a')
        mat.opacity = 0.15
        mat.depthWrite = false
      }
    } else if (type === 'bone') {
      mesh.visible = layer === 'skeleton' || layer === 'skin' || layer === 'nerves'

      if (layer === 'skeleton') {
        mat.color.set('#e8e2d6')
        mat.emissive.set('#1a3040')
        mat.emissiveIntensity = 0.1
        mat.opacity = 0.95
        mat.depthWrite = true
      } else if (layer === 'nerves') {
        mat.color.set('#e6d84a')
        mat.emissive.set('#8a7a10')
        mat.emissiveIntensity = 0.28
        mat.opacity = 0.72
        mat.depthWrite = false
      } else if (layer === 'skin') {
        mat.color.set('#e8e2d6')
        mat.opacity = 0.12
        mat.depthWrite = false
      }
    } else {
      mesh.visible = layer === 'organs' || layer === 'skin'
      mat.color.set(layer === 'organs' ? '#c4a35a' : '#c4a18a')
      mat.opacity = 0.4
      mat.depthWrite = false
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
  onSelect: (name: string, type: string) => void
}) {
  const { scene } = useGLTF('/models/body.glb', true)
  const invalidate = useThree((s) => s.invalidate)
  const packsRef = useRef<MeshPack[] | null>(null)

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
    applyLayerPass1(packsRef.current, layer, selectedName)
    invalidate()
  }, [root, layer, selectedName, invalidate])

  return (
    <primitive
      object={root}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onSelect(e.object.name || 'structure', meshType(e.object))
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
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
  onPick: (name: string, type: string) => void
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
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.5, 4, 2]} intensity={1.25} />
      <directionalLight position={[-2, 1, -1]} intensity={0.35} color="#5ce1ff" />
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
          onSelect={(name, type) => {
            setSelectedName(name)
            onPick(name, type)
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
      <ContactShadows position={[0, -0.02, 0]} opacity={0.32} scale={4} blur={2} frames={1} />
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
