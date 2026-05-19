import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/shared/hooks/useToast'
import { OnboardingShell } from './OnboardingShell'
import { useOnboardingStore } from '../hooks/useOnboardingStore'
import { tokens } from '@/shared/ui/tokens'
import { SkillTile } from '@/shared/ui/SkillTile'
import type { SkillKey } from '@/shared/ui/tokens'

const LANG_FLAGS: Record<string, string> = {
  vi: '🇻🇳', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', th: '🇹🇭', id: '🇮🇩', other: '🌐',
}

const PRESET_LABELS: Record<string, string> = {
  study_abroad: '📚 Study abroad',
  migration: '🏠 Migration',
  career: '👑 Career',
  improve: '✨ Self-improvement',
  high_score: '🏆 High score',
  custom: '⚙️ Custom',
}

export function StepSummary() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const store = useOnboardingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const { displayName, nativeLanguage, ieltsType, selfReport, goalPreset, targetBand, targetDate } = store

  const initials = displayName.slice(0, 2).toUpperCase() || 'IV'
  const totalXP = 20 + 60 + 40 + 60

  const handleFinish = async () => {
    setLoading(true)
    setError('')
    try {
      await store.complete()
      toast.success('Setup complete! Welcome to iVelox 🎉')
      navigate('/')
    } catch (e) {
      const msg = toast.error(e, t('common.error'))
      setError(msg)
      setLoading(false)
    }
  }

  const skills = ['reading', 'listening', 'writing', 'speaking'] as SkillKey[]

  return (
    <OnboardingShell step={4}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h1 style={{ margin: '0 0 8px', fontSize: 30, fontWeight: 700, letterSpacing: -0.9, color: tokens.ink }}>{t('onboarding.step4.title')}</h1>
          <p style={{ margin: 0, color: tokens.text, fontSize: 15 }}>{t('onboarding.step4.subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Profile card */}
          <div style={{ background: '#fff', border: `1px solid ${tokens.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: tokens.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>{t('onboarding.step4.yourProfile')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: 'linear-gradient(135deg, #aa3bff, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{initials}</span>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.ink }}>{displayName || '—'}</div>
                <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>
                  {LANG_FLAGS[nativeLanguage]} {nativeLanguage.toUpperCase()} · {ieltsType === 'academic' ? 'IELTS Academic' : 'IELTS General'}
                </div>
              </div>
            </div>
          </div>

          {/* Goal card */}
          <div style={{ background: '#fff', border: `1px solid ${tokens.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: tokens.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>{t('onboarding.step4.yourGoal')}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tokens.ink }}>{PRESET_LABELS[goalPreset] ?? goalPreset}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: tokens.accent, letterSpacing: -1, fontFamily: tokens.mono, lineHeight: 1 }}>{targetBand}</span>
              <span style={{ fontSize: 13, color: tokens.muted }}>target band</span>
            </div>
            {targetDate && targetDate !== 'none' && (
              <div style={{ fontSize: 12, color: tokens.muted, marginTop: 4, fontFamily: tokens.mono }}>in {targetDate}</div>
            )}
          </div>
        </div>

        {/* Band estimates */}
        <div style={{ background: '#fff', border: `1px solid ${tokens.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: tokens.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 16 }}>{t('onboarding.step4.yourBands')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {skills.map(skill => {
              const s = tokens.skills[skill]
              return (
                <div key={skill} style={{ textAlign: 'center' }}>
                  <SkillTile skill={skill} size={40} />
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -0.5, fontFamily: tokens.mono, lineHeight: 1, marginTop: 8 }}>
                    {selfReport[skill].toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: tokens.muted, textTransform: 'capitalize', marginTop: 2 }}>{skill}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* XP summary */}
        <div style={{ background: 'linear-gradient(135deg, #faf5ff, #fff)', border: `1px solid ${tokens.accentBorder}`, borderRadius: 16, padding: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div>
            <div style={{ fontSize: 13, color: tokens.muted, fontWeight: 600 }}>{t('onboarding.step4.totalXP')}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: tokens.accent, letterSpacing: -0.5, fontFamily: tokens.mono }}>+{totalXP} XP</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: tokens.muted, textAlign: 'right', maxWidth: 200 }}>{t('onboarding.step4.firstMission')}</div>
        </div>

        {error && <p style={{ fontSize: 13, color: tokens.danger, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/onboarding/step/3')} style={{ padding: '10px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: tokens.ink, cursor: 'pointer' }}>
            ← {t('common.back')}
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleFinish}
            disabled={loading}
            style={{
              padding: '14px 32px', borderRadius: 14,
              background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
              color: '#fff', border: 'none',
              fontFamily: tokens.font, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(170,59,255,0.40)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? t('common.loading') : t('onboarding.step4.cta')}
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
