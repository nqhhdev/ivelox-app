import { useAuthStore } from '@/shared/hooks/useAuth'
import { useOnboardingStore } from '@/features/onboarding/hooks/useOnboardingStore'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'

const SKILLS = [
  { key: 'reading',   label: 'Reading',   icon: '📖', color: tokens.skills.reading.color,   xp: 420, level: 7, progress: 68 },
  { key: 'listening', label: 'Listening', icon: '🎧', color: tokens.skills.listening.color, xp: 310, level: 6, progress: 45 },
  { key: 'writing',   label: 'Writing',   icon: '✏️', color: tokens.skills.writing.color,   xp: 180, level: 5, progress: 30 },
  { key: 'speaking',  label: 'Speaking',  icon: '🎙️', color: tokens.skills.speaking.color,  xp: 95,  level: 4, progress: 20 },
] as const

const QUICK_STATS = [
  { label: 'Day Streak',   value: '7',     icon: '🔥', color: '#f97316' },
  { label: 'Total XP',     value: '1,005', icon: '⚡', color: '#fbbf24' },
  { label: 'Est. Band',    value: '6.0',   icon: '🎯', color: '#aa3bff' },
  { label: 'Lessons Done', value: '24',    icon: '✅', color: '#22c55e' },
]

export default function HomePage() {
  const { user, signOut } = useAuthStore()
  const { displayName, targetBand, selfReport } = useOnboardingStore()

  const name = displayName || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const avgBand = (Object.values(selfReport).reduce((a, b) => a + b, 0) / 4)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      fontFamily: tokens.font, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle bg confetti */}
      <svg width="100%" height="100%" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.12, zIndex: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = (i * 53 + 17) % 100
          const y = (i * 79 + 31) % 100
          const col = ['#aa3bff', '#fbbf24', '#22c55e', '#3b82f6', '#f97316'][i % 5]
          return <rect key={i} x={`${x}%`} y={`${y}%`} width="8" height="3" fill={col} transform={`rotate(${i * 30})`} opacity="0.8" />
        })}
      </svg>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'rgba(15,10,26,0.75)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <LogoMark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {name[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{name}</span>
          </div>
          <button
            onClick={signOut}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)', fontFamily: tokens.font, fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Hero greeting */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Welcome back
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 36, fontWeight: 800, letterSpacing: -1.1, lineHeight: 1.1 }}>
            Hey, {name} 👋
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            Current estimate{' '}
            <span style={{ color: '#fbbf24', fontWeight: 800, fontFamily: tokens.mono }}>{avgBand.toFixed(1)}</span>
            {' '}· Target{' '}
            <span style={{ color: tokens.accent, fontWeight: 800, fontFamily: tokens.mono }}>{targetBand}</span>
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {QUICK_STATS.map((s) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 14, padding: '16px 18px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: tokens.mono, letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Skill cards */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Skills
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {SKILLS.map((s) => (
              <div key={s.key} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 16, padding: '20px 22px',
                backdropFilter: 'blur(12px)', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: `${s.color}20`, border: `1px solid ${s.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: tokens.mono }}>Level {s.level}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: tokens.mono }}>{selfReport[s.key as keyof typeof selfReport].toFixed(1)}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>band</div>
                  </div>
                </div>

                {/* XP progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${s.progress}%`,
                      background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: tokens.mono, whiteSpace: 'nowrap' }}>
                    {s.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{
            padding: '16px 52px', borderRadius: 14,
            background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
            color: '#fff', border: 'none',
            fontFamily: tokens.font, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 16px 40px rgba(170,59,255,0.45)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>
            ⚡ Start Practice
          </button>
        </div>
      </main>
    </div>
  )
}
