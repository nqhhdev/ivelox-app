import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogoMark } from '@/shared/ui/LogoMark'
import { Pill } from '@/shared/ui/Pill'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useOnboardingStore } from '../hooks/useOnboardingStore'

const STEP_ICONS = ['👤', '🎯', '👑', '🏆']
const STEP_XP = [20, 80, 40, 60]

export function OnboardingWelcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setStep } = useOnboardingStore()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  const steps = [
    t('onboarding.welcome.steps.profile', { returnObjects: true }) as { title: string; sub: string },
    t('onboarding.welcome.steps.placement', { returnObjects: true }) as { title: string; sub: string },
    t('onboarding.welcome.steps.goals', { returnObjects: true }) as { title: string; sub: string },
    t('onboarding.welcome.steps.youreIn', { returnObjects: true }) as { title: string; sub: string },
  ]

  const handleStart = () => {
    setStep(1)
    navigate('/onboarding/step/1')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      color: '#fff', fontFamily: tokens.font,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55 }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 37 + 13) % 1440
          const y = (i * 73 + 29) % 900
          const col = ['#aa3bff', '#fbbf24', '#22c55e', '#3b82f6', '#f97316'][i % 5]
          return <rect key={i} x={x} y={y} width="8" height="3" fill={col} transform={`rotate(${i * 30} ${x + 4} ${y + 1.5})`} opacity="0.8" />
        })}
      </svg>

      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}><LanguageSwitcher /></div>

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 720, padding: '0 24px' }}>
        <LogoMark />

        <div style={{ marginTop: 24 }}>
          <Pill color="#fbbf24" bg="rgba(251,191,36,0.18)">
            ✨ {t('onboarding.welcome.badge')}
          </Pill>
        </div>

        <h1 style={{ margin: '20px 0 12px', fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: '#fff' }}>
          {t('onboarding.welcome.title')}{' '}
          <span style={{ background: 'linear-gradient(135deg, #aa3bff, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {firstName}
          </span>
          .
        </h1>

        <p style={{ margin: 0, fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: t('onboarding.welcome.subtitle') }}
        />

        {/* 4-step preview grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 36 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 14, padding: 18, textAlign: 'left',
              backdropFilter: 'blur(6px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(170,59,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {STEP_ICONS[i]}
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', fontFamily: tokens.mono }}>+{STEP_XP[i]} XP</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Step {i + 1}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          style={{
            marginTop: 32, padding: '16px 36px', borderRadius: 14,
            background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
            color: '#fff', border: 'none',
            fontFamily: tokens.font, fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 16px 40px rgba(170,59,255,0.5)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
        >
          ▶ {t('onboarding.welcome.cta')}
        </button>
        <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: tokens.mono }}>
          {t('onboarding.welcome.xpNote')}
        </div>
      </div>
    </div>
  )
}
