import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { OnboardingShell } from './OnboardingShell'
import { useOnboardingStore } from '../hooks/useOnboardingStore'
import { profileSchema, type ProfileFormValues, NATIVE_LANGUAGES, type NativeLanguage } from '../schemas/onboarding.schemas'
import { tokens } from '@/shared/ui/tokens'

const LANG_FLAGS: Record<NativeLanguage, string> = {
  vi: '🇻🇳', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', th: '🇹🇭', id: '🇮🇩', other: '🌐',
}

export function StepProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { displayName, nativeLanguage, ieltsType, updateProfile, setStep } = useOnboardingStore()

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName, nativeLanguage, ieltsType },
  })

  const watchedName = watch('displayName', displayName)
  const initials = watchedName.slice(0, 2).toUpperCase() || 'IV'

  const onSubmit = handleSubmit((data) => {
    updateProfile(data)
    setStep(2)
    navigate('/onboarding/step/2')
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${tokens.borderStrong}`,
    background: '#fff', color: tokens.ink,
    fontFamily: tokens.font, fontSize: 14, outline: 'none',
  }

  return (
    <OnboardingShell step={1} onSkip={() => navigate('/onboarding/step/2')}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 540px) 1fr', gap: 40 }}>
        <div />
        <div style={{ background: '#fff', border: `1px solid ${tokens.border}`, borderRadius: 22, padding: 36, boxShadow: '0 24px 60px -24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 11, color: tokens.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t('onboarding.step1.badge')}</div>
          <h1 style={{ margin: '6px 0 6px', fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: tokens.ink }}>{t('onboarding.step1.title')}</h1>
          <p style={{ margin: 0, color: tokens.text, fontSize: 14 }}>{t('onboarding.step1.subtitle')}</p>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 88, height: 88, borderRadius: 999, background: 'linear-gradient(135deg, #aa3bff, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{initials}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{t('onboarding.step1.avatarLabel')}</div>
              <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>{t('onboarding.step1.avatarHint')}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="button" style={{ padding: '6px 12px', borderRadius: 8, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: tokens.ink }}>
                  {t('onboarding.step1.uploadBtn')}
                </button>
                <button type="button" style={{ padding: '6px 12px', borderRadius: 8, background: tokens.accentSoft, border: `1px solid ${tokens.accentBorder}`, color: tokens.accent, fontFamily: tokens.font, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {t('onboarding.step1.generateBtn')}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24 }}>
            {/* Display name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: tokens.ink, marginBottom: 6 }}>{t('onboarding.step1.nameLabel')}</label>
              <input {...register('displayName')} placeholder={t('onboarding.step1.namePlaceholder')} style={{ ...inputStyle, borderColor: errors.displayName ? tokens.danger : tokens.borderStrong }} />
              {errors.displayName
                ? <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{errors.displayName.message}</p>
                : <p style={{ fontSize: 11, color: tokens.muted, marginTop: 4 }}>{t('onboarding.step1.nameHelper')}</p>
              }
            </div>

            {/* Native language */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: tokens.ink, display: 'block', marginBottom: 6 }}>{t('onboarding.step1.languageLabel')}</span>
              <Controller
                name="nativeLanguage"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {NATIVE_LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => field.onChange(lang)}
                        style={{
                          padding: '8px 12px', borderRadius: 10,
                          background: field.value === lang ? tokens.accentSoft : '#fff',
                          color: field.value === lang ? tokens.accent : tokens.ink,
                          border: field.value === lang ? `1.5px solid ${tokens.accent}` : `1px solid ${tokens.border}`,
                          fontFamily: tokens.font, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{LANG_FLAGS[lang]}</span>
                        {t(`onboarding.step1.languages.${lang}`)}
                      </button>
                    ))}
                  </div>
                )}
              />
              <p style={{ fontSize: 11, color: tokens.muted, marginTop: 6 }}>{t('onboarding.step1.languageHint')}</p>
            </div>

            {/* IELTS type */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: tokens.ink, display: 'block', marginBottom: 6 }}>{t('onboarding.step1.ieltsLabel')}</span>
              <Controller
                name="ieltsType"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {([
                      { value: 'academic', title: t('onboarding.step1.ieltsAcademic'), sub: t('onboarding.step1.ieltsAcademicSub') },
                      { value: 'general', title: t('onboarding.step1.ieltsGeneral'), sub: t('onboarding.step1.ieltsGeneralSub') },
                    ] as const).map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => field.onChange(o.value)}
                        style={{
                          padding: 14, borderRadius: 12,
                          background: field.value === o.value ? tokens.accentSoft : '#fff',
                          border: field.value === o.value ? `1.5px solid ${tokens.accent}` : `1px solid ${tokens.border}`,
                          fontFamily: tokens.font, textAlign: 'left', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{o.title}</div>
                        <div style={{ fontSize: 12, color: tokens.muted, marginTop: 2 }}>{o.sub}</div>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => navigate('/onboarding/welcome')} style={{ padding: '10px 16px', borderRadius: 12, background: '#fff', border: `1px solid ${tokens.border}`, fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: tokens.ink, cursor: 'pointer' }}>
                ← {t('common.back')}
              </button>
              <div style={{ flex: 1 }} />
              <button type="submit" disabled={isSubmitting} style={{
                padding: '12px 24px', borderRadius: 12,
                background: tokens.accent, color: '#fff', border: 'none',
                fontFamily: tokens.font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(170,59,255,0.30)',
                opacity: isSubmitting ? 0.7 : 1,
              }}>
                {t('onboarding.step1.cta')}
              </button>
            </div>
          </form>
        </div>
        <div />
      </div>
    </OnboardingShell>
  )
}
