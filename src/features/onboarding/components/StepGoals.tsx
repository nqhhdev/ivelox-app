import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { OnboardingShell } from './OnboardingShell'
import { useOnboardingStore } from '../hooks/useOnboardingStore'
import { Pill } from '@/shared/ui/Pill'
import { tokens } from '@/shared/ui/tokens'
import { GOAL_PRESETS, DATE_OPTIONS, type GoalPreset, type DateOption } from '../schemas/onboarding.schemas'

const GOAL_META: Record<GoalPreset, { icon: string; color: string; band: number }> = {
  study_abroad: { icon: '📚', color: tokens.skills.reading.color, band: 6.5 },
  migration:    { icon: '🏠', color: tokens.skills.listening.color, band: 7.0 },
  career:       { icon: '👑', color: tokens.skills.speaking.color, band: 7.5 },
  improve:      { icon: '✨', color: tokens.skills.writing.color, band: 6.0 },
  high_score:   { icon: '🏆', color: '#fbbf24', band: 8.0 },
  custom:       { icon: '⚙️', color: tokens.accent, band: 6.5 },
}

export function StepGoals() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { goalPreset, targetDate, updateGoals, setStep } = useOnboardingStore()

  const [selectedPreset, setSelectedPreset] = useState<GoalPreset>(goalPreset)
  const [selectedDate, setSelectedDate] = useState<DateOption | null>(targetDate ?? '90d')

  const handleContinue = () => {
    const meta = GOAL_META[selectedPreset]
    updateGoals({ goalPreset: selectedPreset, targetBand: meta.band, targetDate: selectedDate })
    setStep(4)
    navigate('/onboarding/step/4')
  }

  return (
    <OnboardingShell step={3} onSkip={() => { handleContinue() }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Pill color={tokens.accent} bg={tokens.accentSoft}>{t('onboarding.step3.badge')}</Pill>
          <h1 style={{ margin: '12px 0 6px', fontSize: 30, fontWeight: 700, letterSpacing: -0.9, color: tokens.ink }}>{t('onboarding.step3.title')}</h1>
          <p style={{ margin: 0, color: tokens.text, fontSize: 15 }}>{t('onboarding.step3.subtitle')}</p>
        </div>

        {/* Goal preset grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {GOAL_PRESETS.map(preset => {
            const meta = GOAL_META[preset]
            const active = selectedPreset === preset
            const presetData = t(`onboarding.step3.presets.${preset}`, { returnObjects: true }) as { title: string; sub: string; ex: string }
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                style={{
                  padding: 22, borderRadius: 16, textAlign: 'left',
                  background: active ? `${meta.color}10` : '#fff',
                  border: active ? `2px solid ${meta.color}` : `1px solid ${tokens.border}`,
                  boxShadow: active ? `0 0 0 4px ${meta.color}1a` : 'none',
                  fontFamily: tokens.font, cursor: 'pointer', position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {meta.icon}
                  </div>
                  {active && <span style={{ color: meta.color, fontSize: 18, fontWeight: 800 }}>✓</span>}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: tokens.ink, marginTop: 14, letterSpacing: -0.3 }}>{presetData.title}</div>
                <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>{presetData.sub}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${tokens.border}` }}>
                  <div>
                    <div style={{ fontSize: 10, color: tokens.muted, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{t('onboarding.step3.targetBand')}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: meta.color, letterSpacing: -0.5, fontFamily: tokens.mono, lineHeight: 1 }}>{meta.band}</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ fontSize: 10, color: tokens.muted, textAlign: 'right', maxWidth: 100 }}>{presetData.ex}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Date picker */}
        <div style={{ background: '#fff', border: `1px solid ${tokens.border}`, borderRadius: 14, padding: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: tokens.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>🕐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{t('onboarding.step3.dateTitle')}</div>
              <div style={{ fontSize: 12, color: tokens.muted, marginTop: 1 }}>{t('onboarding.step3.dateSub')}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DATE_OPTIONS.map(d => {
                const label = t(`onboarding.step3.dates.${d === '30d' ? 'd30' : d === '60d' ? 'd60' : d === '90d' ? 'd90' : d === '6m' ? 'm6' : d === '1y' ? 'y1' : 'none'}`)
                return (
                  <button key={d} type="button" onClick={() => setSelectedDate(d === selectedDate ? null : d)} style={{
                    padding: '8px 12px', borderRadius: 10,
                    background: selectedDate === d ? tokens.ink : '#fff',
                    color: selectedDate === d ? '#fff' : tokens.text,
                    border: selectedDate === d ? 'none' : `1px solid ${tokens.border}`,
                    fontFamily: tokens.font, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/onboarding/step/2')} style={{ padding: '10px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: tokens.ink, cursor: 'pointer' }}>
            ← {t('common.back')}
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleContinue} style={{
            padding: '12px 24px', borderRadius: 12,
            background: tokens.accent, color: '#fff', border: 'none',
            fontFamily: tokens.font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(170,59,255,0.30)',
          }}>
            {t('onboarding.step3.cta')}
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
