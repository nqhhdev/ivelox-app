import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'

export type BodyLayer = 'fat' | 'vessels' | 'bone'

export type AtlasRegion = {
  id: string
  label: string
  position: number[]
  tips: { layer: string; text: string; citation_ids: string[] }[]
}

export type BodyMetrics = {
  bmi?: number | null
  bmiCategory?: string | null
  bodyFatPct?: number | null
  kcalLeft?: number | null
  proteinG?: number | null
  proteinTarget?: number | null
  weightKg?: number | null
  targetWeightKg?: number | null
}

const LAYER_COLORS: Record<BodyLayer, string> = {
  fat: '#c4a35a',
  vessels: '#c45c5c',
  bone: '#d8d2c4',
}

function Hotspot({
  region,
  activeLayer,
  selected,
  onSelect,
}: {
  region: AtlasRegion
  activeLayer: BodyLayer
  selected: boolean
  onSelect: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const tip = region.tips.find((t) => t.layer === activeLayer)
  const pos = region.position as [number, number, number]

  return (
    <group position={pos}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onSelect(region.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={selected || hovered ? LAYER_COLORS[activeLayer] : '#75d18c'}
          emissive={selected || hovered ? LAYER_COLORS[activeLayer] : '#0b3954'}
          emissiveIntensity={selected || hovered ? 0.55 : 0.15}
          transparent
          opacity={0.9}
        />
      </mesh>
      {(hovered || selected) && tip && (
        <Html distanceFactor={6} position={[0.2, 0.15, 0]} style={{ pointerEvents: 'none' }}>
          <div className="grg-body3d-tip">
            <strong>{region.label}</strong>
            <p>{tip.text}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function StylizedBody({ layer }: { layer: BodyLayer }) {
  const skin = layer === 'fat' ? '#8b6b3d' : layer === 'vessels' ? '#5a3030' : '#9a9488'
  const accent = LAYER_COLORS[layer]
  const pulse = layer === 'vessels'

  return (
    <Float speed={pulse ? 2.2 : 1.2} rotationIntensity={0.08} floatIntensity={0.15}>
      <group>
        {/* head */}
        <mesh position={[0, 1.35, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color={skin} roughness={0.55} metalness={0.05} />
        </mesh>
        {/* torso */}
        <mesh position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.28, 0.55, 8, 16]} />
          <meshStandardMaterial color={skin} roughness={0.5} />
        </mesh>
        {/* fat overlay abdomen */}
        {layer === 'fat' && (
          <mesh position={[0, 0.4, 0.12]} scale={[1.15, 0.9, 1.2]}>
            <sphereGeometry args={[0.22, 20, 20]} />
            <meshStandardMaterial color={accent} transparent opacity={0.45} roughness={0.8} />
          </mesh>
        )}
        {/* vessel glow core */}
        {layer === 'vessels' && (
          <mesh position={[0, 0.75, 0]}>
            <capsuleGeometry args={[0.06, 0.7, 4, 8]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} transparent opacity={0.7} />
          </mesh>
        )}
        {/* bone spine hint */}
        {layer === 'bone' && (
          <mesh position={[0, 0.7, -0.05]}>
            <capsuleGeometry args={[0.05, 0.85, 4, 8]} />
            <meshStandardMaterial color={accent} roughness={0.35} metalness={0.1} />
          </mesh>
        )}
        {/* arms */}
        <mesh position={[-0.48, 0.75, 0]} rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[0.08, 0.45, 6, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0.48, 0.75, 0]} rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[0.08, 0.45, 6, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {/* legs */}
        <mesh position={[-0.16, -0.15, 0]}>
          <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0.16, -0.15, 0]}>
          <capsuleGeometry args={[0.1, 0.55, 6, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
    </Float>
  )
}

export function Body3DCanvas({
  regions,
  layer,
  selectedId,
  onSelect,
}: {
  regions: AtlasRegion[]
  layer: BodyLayer
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <Canvas camera={{ position: [0, 0.6, 3.2], fov: 42 }} dpr={[1, 1.75]}>
      <color attach="background" args={['#03090b']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <pointLight position={[-2, 1, 2]} intensity={0.4} color="#75d18c" />
      <StylizedBody layer={layer} />
      {regions.map((r) => (
        <Hotspot
          key={r.id}
          region={r}
          activeLayer={layer}
          selected={selectedId === r.id}
          onSelect={onSelect}
        />
      ))}
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={5} maxPolarAngle={Math.PI * 0.72} />
    </Canvas>
  )
}

/** Deurenberg-style educational estimate (matches BE BodyMath). */
export function estimateBodyFatPct(bmi: number, ageYears: number, sex: string): number {
  const sexAdj = sex.toLowerCase() === 'female' ? 1 : 0
  const est = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexAdj - 5.4
  return Math.max(5, Math.min(50, Math.round(est * 10) / 10))
}

export function useWebGLOk(): boolean {
  return useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }, [])
}
