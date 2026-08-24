import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Billboard, OrbitControls, useGLTF, Html } from '@react-three/drei'
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

const LAYER_COLOR = {
  muscle_vessels: new THREE.Color('#9a3a3a'),
  muscle_fat: new THREE.Color('#b8965a'),
  muscle_default: new THREE.Color('#8f4545'),
  muscle_skin: new THREE.Color('#a88870'),
  bone: new THREE.Color('#d8d2c6'),
  nerve: new THREE.Color('#c4b84a'),
  accent: new THREE.Color('#75d18c'),
}

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
    mat.roughness = 0.72
    packs.push({ mesh, type: meshType(mesh), mat })
  })
  return packs
}

function applyLayer(packs: MeshPack[], layer: AnatomyLayer, selectedName: string | null) {
  for (const { mesh, type, mat } of packs) {
    const selected = selectedName != null && mesh.name === selectedName

    if (type === 'muscle') {
      mesh.visible =
        layer === 'skin' ||
        layer === 'muscles' ||
        layer === 'vessels' ||
        layer === 'visceral_fat' ||
        layer === 'organs'
      if (layer === 'vessels') {
        mat.color.copy(LAYER_COLOR.muscle_vessels)
        mat.emissive.set('#4a1010')
        mat.emissiveIntensity = 0.22
        mat.opacity = 0.5
        mat.depthWrite = false
      } else if (layer === 'visceral_fat') {
        mat.color.copy(LAYER_COLOR.muscle_fat)
        mat.emissive.set('#000000')
        mat.emissiveIntensity = 0
        mat.opacity = 0.32
        mat.depthWrite = false
      } else if (layer === 'muscles') {
        mat.color.copy(LAYER_COLOR.muscle_default)
        mat.emissive.set('#000000')
        mat.emissiveIntensity = 0
        mat.opacity = 0.9
        mat.depthWrite = true
      } else if (layer === 'skin') {
        mat.color.copy(LAYER_COLOR.muscle_skin)
        mat.emissive.set('#000000')
        mat.emissiveIntensity = 0
        mat.opacity = 0.2
        mat.depthWrite = false
      } else {
        mat.opacity = 0.14
        mat.emissiveIntensity = 0
        mat.depthWrite = false
      }
    } else if (type === 'bone') {
      mesh.visible = layer === 'skeleton' || layer === 'skin' || layer === 'nerves'
      if (layer === 'skeleton') {
        mat.color.copy(LAYER_COLOR.bone)
        mat.emissive.set('#0a1810')
        mat.emissiveIntensity = 0.06
        mat.opacity = 0.95
        mat.depthWrite = true
      } else if (layer === 'nerves') {
        mat.color.copy(LAYER_COLOR.nerve)
        mat.emissive.set('#5a5010')
        mat.emissiveIntensity = 0.18
        mat.opacity = 0.65
        mat.depthWrite = false
      } else {
        mat.opacity = layer === 'skin' ? 0.1 : 0.18
        mat.emissiveIntensity = 0
        mat.depthWrite = false
      }
    } else {
      mesh.visible = layer === 'organs' || layer === 'skin'
      mat.opacity = 0.35
      mat.depthWrite = false
    }

    if (selected && mesh.visible) {
      mat.emissive.copy(LAYER_COLOR.accent)
      mat.emissiveIntensity = 0.45
      mat.opacity = Math.max(mat.opacity, 0.85)
    }
  }
}

function InvalidateOnChange({
  layer,
  selectedName,
  showJoints,
  activeJointId,
}: {
  layer: AnatomyLayer
  selectedName: string | null
  showJoints?: boolean
  activeJointId?: string | null
}) {
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    invalidate()
  }, [invalidate, layer, selectedName, showJoints, activeJointId])
  return null
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
  const packsRef = useRef<MeshPack[] | null>(null)

  const root = useMemo(() => {
    const clone = scene.clone(true)
    packsRef.current = buildPacks(clone)
    clone.position.set(0, -0.05, 0)
    return clone
  }, [scene])

  useEffect(() => {
    if (!packsRef.current) return
    applyLayer(packsRef.current, layer, selectedName)
  }, [root, layer, selectedName])

  return (
    <primitive
      object={root}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onSelect(e.object.name || 'structure', meshType(e.object))
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

  return (
    <Canvas
      camera={{ position: [0.55, 1.05, 2.2], fov: 36, near: 0.05, far: 40 }}
      dpr={[1, 1.25]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#03090b', 0)
      }}
    >
      <InvalidateOnChange
        layer={layer}
        selectedName={selectedName}
        showJoints={showJoints}
        activeJointId={activeJointId}
      />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.2, 3.5, 2]} intensity={1.05} />
      <directionalLight position={[-1.8, 1.2, -1]} intensity={0.28} color="#75d18c" />
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
      <OrbitControls
        makeDefault
        target={[0, 0.9, 0]}
        minDistance={1.15}
        maxDistance={3.8}
        maxPolarAngle={Math.PI * 0.82}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        onChange={() => {
          /* demand loop: OrbitControls calls invalidate via makeDefault */
        }}
      />
    </Canvas>
  )
}
