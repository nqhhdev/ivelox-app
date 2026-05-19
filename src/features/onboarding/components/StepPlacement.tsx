import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { OnboardingShell } from './OnboardingShell'
import { useOnboardingStore } from '../hooks/useOnboardingStore'
import { BandSlider } from '@/shared/ui/BandSlider'
import { Pill } from '@/shared/ui/Pill'
import { tokens } from '@/shared/ui/tokens'
import type { SkillKey } from '@/shared/ui/tokens'

export function StepPlacement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selfReport, updatePlacement, setStep } = useOnboardingStore()

  const [values, setValues] = useState(selfReport)

  const SKILL_DESCS: Record<SkillKey, string> = {
    reading: "I usually get the gist, miss some details.",
    listening: "Fine with native speakers at native rate.",
    writing: "Can write clearly, grammar slips sometimes.",
    speaking: "Conversational, hesitate on topics.",
  }

  const handleContinue = () => {
    updatePlacement(values)
    setStep(3)
    navigate('/onboarding/step/3')
  }

  return (
    <OnboardingShell step={2} onSkip={() => { updatePlacement(values); setStep(3); navigate('/onboarding/step/3') }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Pill color={tokens.accent} bg={tokens.accentSoft}>{t('onboarding.step2.badge')}</Pill>
          <h1 style={{ margin: '12px 0 6px', fontSize: 30, fontWeight: 700, letterSpacing: -0.9, color: tokens.ink }}>{t('onboarding.step2.title')}</h1>
          <p style={{ margin: 0, color: tokens.text, fontSize: 15, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            {t('onboarding.step2.subtitle')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 18 }}>
          {(['reading', 'listening', 'writing', 'speaking'] as SkillKey[]).map(skill => (
            <BandSlider
              key={skill}
              skill={skill}
              value={values[skill]}
              descLabel={SKILL_DESCS[skill]}
              onChange={v => setValues(prev => ({ ...prev, [skill]: v }))}
            />
          ))}
        </div>

        {/* Quick test promo */}
        <div style={{ background: tokens.accentSoft, border: `1px solid ${tokens.accentBorder}`, borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: tokens.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{t('onboarding.step2.quickTestTitle')}</div>
            <div style={{ fontSize: 12, color: tokens.text, marginTop: 2 }}>{t('onboarding.step2.quickTestSub')}</div>
          </div>
          <button style={{ padding: '8px 14px', borderRadius: 10, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: tokens.ink, cursor: 'not-allowed', opacity: 0.6 }}>
            {t('onboarding.step2.quickTestBtn')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/onboarding/step/1')} style={{ padding: '10px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: tokens.ink, cursor: 'pointer' }}>
            ← {t('common.back')}
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleContinue} style={{
            padding: '12px 24px', borderRadius: 12,
            background: tokens.accent, color: '#fff', border: 'none',
            fontFamily: tokens.font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(170,59,255,0.30)',
          }}>
            {t('onboarding.step2.cta')}
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
