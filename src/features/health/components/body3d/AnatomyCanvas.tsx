import { Suspense, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const C = {
  vessels: new THREE.Color('#c45c5c'),
  vesselsEm: new THREE.Color('#7a1818'),
  fat: new THREE.Color('#c4a35a'),
  muscle: new THREE.Color('#b04a4a'),
  skin: new THREE.Color('#c4a18a'),
  bone: new THREE.Color('#e8e2d6'),
  boneEm: new THREE.Color('#1a3040'),
  nerve: new THREE.Color('#e6d84a'),
  nerveEm: new THREE.Color('#8a7a10'),
  accent: new THREE.Color('#75d18c'),
  ghost: new THREE.Color('#6a7880'),
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
    mat.metalness = 0.04
    mat.roughness = 0.68
    packs.push({ mesh, type: meshType(mesh), mat })
  })
  return packs
}

/** Layer look closer to the first GLB pass — clear focus + soft ghost context. */
function applyLayer(packs: MeshPack[], layer: AnatomyLayer, selectedName: string | null) {
  for (const { mesh, type, mat } of packs) {
    const selected = selectedName != null && mesh.name === selectedName
    mat.wireframe = false
    mat.emissive.set('#000000')
    mat.emissiveIntensity = 0

    if (type === 'muscle') {
      if (layer === 'vessels') {
        mesh.visible = true
        mat.color.copy(C.vessels)
        mat.emissive.copy(C.vesselsEm)
        mat.emissiveIntensity = 0.4
        mat.opacity = 0.58
        mat.depthWrite = false
      } else if (layer === 'visceral_fat') {
        mesh.visible = true
        mat.color.copy(C.fat)
        mat.opacity = 0.38
        mat.depthWrite = false
      } else if (layer === 'muscles') {
        mesh.visible = true
        mat.color.copy(C.muscle)
        mat.opacity = 0.94
        mat.depthWrite = true
      } else if (layer === 'skin') {
        mesh.visible = true
        mat.color.copy(C.skin)
        mat.opacity = 0.24
        mat.depthWrite = false
      } else if (layer === 'organs') {
        mesh.visible = true
        mat.color.copy(C.muscle)
        mat.opacity = 0.18
        mat.depthWrite = false
      } else if (layer === 'skeleton' || layer === 'nerves') {
        // Soft ghost so bones/nerves keep body context
        mesh.visible = true
        mat.color.copy(C.ghost)
        mat.opacity = 0.1
        mat.depthWrite = false
      } else {
        mesh.visible = false
      }
    } else if (type === 'bone') {
      if (layer === 'skeleton') {
        mesh.visible = true
        mat.color.copy(C.bone)
        mat.emissive.copy(C.boneEm)
        mat.emissiveIntensity = 0.1
        mat.opacity = 0.96
        mat.depthWrite = true
      } else if (layer === 'nerves') {
        mesh.visible = true
        mat.color.copy(C.nerve)
        mat.emissive.copy(C.nerveEm)
        mat.emissiveIntensity = 0.28
        mat.opacity = 0.72
        mat.depthWrite = false
      } else if (layer === 'skin') {
        mesh.visible = true
        mat.color.copy(C.bone)
        mat.opacity = 0.12
        mat.depthWrite = false
      } else if (layer === 'muscles' || layer === 'vessels' || layer === 'visceral_fat') {
        mesh.visible = true
        mat.color.copy(C.bone)
        mat.opacity = 0.14
        mat.depthWrite = false
      } else if (layer === 'organs') {
        mesh.visible = true
        mat.color.copy(C.bone)
        mat.opacity = 0.08
        mat.depthWrite = false
      } else {
        mesh.visible = false
      }
    } else {
      mesh.visible = layer === 'organs' || layer === 'skin'
      mat.color.copy(layer === 'organs' ? C.fat : C.skin)
      mat.opacity = layer === 'organs' ? 0.55 : 0.25
      mat.depthWrite = false
    }

    if (selected && mesh.visible) {
      mat.emissive.copy(C.accent)
      mat.emissiveIntensity = 0.55
      mat.opacity = Math.max(mat.opacity, 0.88)
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
    clone.position.set(0, -0.05, 0)
    return clone
  }, [scene])

  useLayoutEffect(() => {
    if (!packsRef.current) return
    applyLayer(packsRef.current, layer, selectedName)
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
    return [0, 0.9, 0]
  }, [showJoints, activeJointId])

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
      <ambientLight intensity={0.5} />
      <directionalLight position={[2.2, 3.5, 2]} intensity={1.2} />
      <directionalLight position={[-1.8, 1.2, -1]} intensity={0.35} color="#75d18c" />
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
        target={orbitTarget}
        minDistance={0.85}
        maxDistance={5.5}
        maxPolarAngle={Math.PI * 0.92}
        enablePan
        screenSpacePanning
        panSpeed={0.9}
        zoomSpeed={0.95}
        rotateSpeed={0.85}
        enableDamping
        dampingFactor={0.12}
      />
    </Canvas>
  )
}

