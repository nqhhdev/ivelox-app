import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { AnatomyLayer } from './bodyMetrics'

export type { AnatomyLayer } from './bodyMetrics'
export {
  estimateBodyFatPct,
  visceralFatScore,
  healthScore,
  useWebGLOk,
} from './bodyMetrics'

export type JointCallout = {
  id: string
  label: string
  position: [number, number, number]
  mobility: number | null
  inflammation: 'Low' | 'Moderate' | 'High' | '—'
}

const JOINTS: JointCallout[] = [
  { id: 'shoulder', label: 'Shoulder', position: [0.28, 1.25, 0.05], mobility: null, inflammation: '—' },
  { id: 'elbow', label: 'Elbow', position: [0.42, 0.95, 0.02], mobility: null, inflammation: '—' },
  { id: 'wrist', label: 'Wrist', position: [0.48, 0.62, 0.02], mobility: null, inflammation: '—' },
  { id: 'hip', label: 'Hip', position: [0.14, 0.72, 0.04], mobility: null, inflammation: '—' },
  { id: 'knee', label: 'Knee', position: [0.14, 0.38, 0.06], mobility: null, inflammation: '—' },
  { id: 'ankle', label: 'Ankle', position: [0.12, 0.08, 0.04], mobility: null, inflammation: '—' },
]

function meshType(obj: THREE.Object3D): string {
  const t = (obj.userData?.type as string | undefined)?.toLowerCase()
  if (t) return t
  const n = obj.name.toLowerCase()
  if (n.includes('bone') || n.includes('skeleton') || n.includes('vertebra') || n.includes('skull')) return 'bone'
  if (n.includes('muscle') || n.includes('muscul')) return 'muscle'
  return 'other'
}

function asStd(mat: THREE.Material | THREE.Material[]): THREE.MeshStandardMaterial | null {
  const m = Array.isArray(mat) ? mat[0] : mat
  if (!m || !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial) return null
  return m as THREE.MeshStandardMaterial
}

function applyLayerMaterial(
  mesh: THREE.Mesh,
  layer: AnatomyLayer,
  type: string,
  selected: boolean,
) {
  const mat = asStd(mesh.material)
  if (!mat) return

  mat.transparent = true
  mat.depthWrite = layer !== 'skin'
  mat.wireframe = false
  mat.emissiveIntensity = 0

  if (selected) {
    mat.emissive = new THREE.Color('#3ecfff')
    mat.emissiveIntensity = 0.55
    mat.opacity = 1
    mat.needsUpdate = true
    return
  }

  if (type === 'muscle') {
    mesh.visible =
      layer === 'skin' ||
      layer === 'muscles' ||
      layer === 'vessels' ||
      layer === 'visceral_fat' ||
      layer === 'organs'
    if (layer === 'vessels') {
      mat.color = new THREE.Color('#c23b3b')
      mat.emissive = new THREE.Color('#7a1010')
      mat.emissiveIntensity = 0.35
      mat.opacity = 0.55
    } else if (layer === 'visceral_fat') {
      mat.color = new THREE.Color('#c4a35a')
      mat.opacity = 0.35
    } else if (layer === 'muscles') {
      mat.color = new THREE.Color('#b04a4a')
      mat.opacity = 0.92
    } else if (layer === 'skin') {
      mat.color = new THREE.Color('#c4a18a')
      mat.opacity = 0.22
    } else {
      mat.opacity = 0.15
    }
  } else if (type === 'bone') {
    mesh.visible = layer === 'skeleton' || layer === 'skin' || layer === 'nerves'
    if (layer === 'skeleton') {
      mat.color = new THREE.Color('#e8e2d6')
      mat.opacity = 0.95
      mat.emissive = new THREE.Color('#1a3040')
      mat.emissiveIntensity = 0.08
    } else if (layer === 'nerves') {
      mat.color = new THREE.Color('#e6d84a')
      mat.emissive = new THREE.Color('#8a7a10')
      mat.emissiveIntensity = 0.25
      mat.opacity = 0.7
    } else {
      mat.opacity = layer === 'skin' ? 0.12 : 0.2
    }
  } else {
    mesh.visible = layer === 'organs' || layer === 'skin'
    mat.opacity = 0.4
  }

  mat.needsUpdate = true
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
  // DRACO decoder from Google CDN (model is DRACO-compressed)
  const { scene } = useGLTF('/models/body.glb', true)

  const root = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        m.castShadow = true
        m.receiveShadow = true
        if (Array.isArray(m.material)) {
          m.material = m.material.map((x) => (x as THREE.Material).clone())
        } else if (m.material) {
          m.material = (m.material as THREE.Material).clone()
        }
      }
    })
    // Normalize orientation / scale for our camera
    clone.scale.setScalar(1)
    clone.rotation.set(0, 0, 0)
    clone.position.set(0, -0.05, 0)
    return clone
  }, [scene])

  useEffect(() => {
    root.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return
      const mesh = o as THREE.Mesh
      const type = meshType(mesh)
      applyLayerMaterial(mesh, layer, type, selectedName === mesh.name)
    })
  }, [root, layer, selectedName])

  return (
    <primitive
      object={root}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        const obj = e.object
        onSelect(obj.name || 'structure', meshType(obj))
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
    <group position={joint.position}>
      <mesh onClick={(e) => { e.stopPropagation(); onClick() }}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshStandardMaterial
          color={active ? '#5ce1ff' : '#3aa0ff'}
          emissive={active ? '#5ce1ff' : '#1a6cff'}
          emissiveIntensity={active ? 0.9 : 0.45}
        />
      </mesh>
      {active && (
        <Html distanceFactor={5} position={[0.12, 0.04, 0]} style={{ pointerEvents: 'none' }}>
          <div className="med-callout">
            <strong>{joint.label}</strong>
            <div>Mobility: {joint.mobility == null ? '—' : `${joint.mobility}%`}</div>
            <div>Inflammation: {joint.inflammation}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

useGLTF.preload('/models/body.glb', true)

export function AnatomyCanvas({
  layer,
  onPick,
}: {
  layer: AnatomyLayer
  onPick: (name: string, type: string) => void
}) {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [activeJoint, setActiveJoint] = useState<string | null>('knee')

  return (
    <Canvas
      camera={{ position: [0.6, 1.1, 2.4], fov: 38, near: 0.01, far: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#07101c']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.5, 4, 2]} intensity={1.25} castShadow />
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
      {JOINTS.map((j) => (
        <JointMarker
          key={j.id}
          joint={j}
          active={activeJoint === j.id}
          onClick={() => setActiveJoint(j.id)}
        />
      ))}
      <ContactShadows position={[0, -0.02, 0]} opacity={0.35} scale={4} blur={2.2} />
      <OrbitControls
        makeDefault
        target={[0, 0.85, 0]}
        minDistance={1.2}
        maxDistance={4.5}
        maxPolarAngle={Math.PI * 0.85}
        enablePan
      />
    </Canvas>
  )
}
