interface BrandOrnamentProps {
  tone?: 'light' | 'dark'
}

export function BrandOrnament({ tone = 'light' }: BrandOrnamentProps) {
  const isDark = tone === 'dark'
  const orbs = [
    { x: 60, y: 80, s: 56, c: '#aa3bff', op: isDark ? 0.5 : 0.16 },
    { x: 280, y: 140, s: 32, c: '#fbbf24', op: isDark ? 0.4 : 0.18 },
    { x: 160, y: 240, s: 80, c: '#3b82f6', op: isDark ? 0.3 : 0.10 },
    { x: 380, y: 360, s: 44, c: '#22c55e', op: isDark ? 0.45 : 0.18 },
    { x: 60, y: 430, s: 36, c: '#f97316', op: isDark ? 0.5 : 0.20 },
  ]
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: o.x,
          top: o.y,
          width: o.s,
          height: o.s,
          borderRadius: 999,
          background: `radial-gradient(circle at 30% 30%, ${o.c}${Math.round(o.op * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          filter: 'blur(6px)',
        }} />
      ))}
    </div>
  )
}
