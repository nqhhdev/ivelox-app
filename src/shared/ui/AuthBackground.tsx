import type { ReactNode } from 'react'

interface AuthBackgroundProps {
  children: ReactNode
}

const CONFETTI = Array.from({ length: 40 }).map((_, i) => ({
  x: (i * 53 + 17) % 100,
  y: (i * 79 + 31) % 100,
  col: ['#aa3bff', '#fbbf24', '#22c55e', '#3b82f6', '#f97316'][i % 5],
  r: i * 30,
}))

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      fontFamily: 'var(--font-sans)',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35 }}>
        {CONFETTI.map((c, i) => (
          <rect key={i} x={`${c.x}%`} y={`${c.y}%`} width="8" height="3"
            fill={c.col} transform={`rotate(${c.r})`} opacity="0.8" />
        ))}
      </svg>
      {children}
    </div>
  )
}
