import { tokens, type SkillKey } from './tokens'
import { SkillTile } from './SkillTile'

interface BandSliderProps {
  skill: SkillKey
  value: number
  descLabel?: string
  onChange?: (value: number) => void
}

export function BandSlider({ skill, value, descLabel, onChange }: BandSliderProps) {
  const s = tokens.skills[skill]
  const pct = ((value - 1) / 8) * 100

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${tokens.border}`,
      borderRadius: 16,
      padding: 22,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <SkillTile skill={skill} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: tokens.ink, textTransform: 'capitalize' }}>{skill}</div>
          {descLabel && <div style={{ fontSize: 12, color: tokens.muted, marginTop: 1 }}>{descLabel}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: -1, lineHeight: 1, fontFamily: tokens.mono }}>{value.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: tokens.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Band</div>
        </div>
      </div>

      <div style={{ position: 'relative', height: 10, background: tokens.border, borderRadius: 999, marginBottom: 8 }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${pct}%`,
          background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
          borderRadius: 999,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 22, height: 22, borderRadius: 999,
          background: '#fff', border: `3px solid ${s.color}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }} />
        <input
          type="range"
          min={1} max={9} step={0.5}
          value={value}
          onChange={e => onChange?.(parseFloat(e.target.value))}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: tokens.muted, fontFamily: tokens.mono, fontWeight: 600 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n} style={{ color: n === Math.round(value) ? s.color : tokens.muted, fontWeight: n === Math.round(value) ? 800 : 500 }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
