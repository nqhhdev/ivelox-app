import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'
import { AuthBackground } from '@/shared/ui/AuthBackground'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const { form, onSubmit, sent, sentEmail } = useForgotPasswordForm()
  const { register, formState: { errors, isSubmitting } } = form

  if (sent) {
    return (
      <AuthBackground>
        <div style={{ position: 'absolute', top: 20, right: 24 }}><LanguageSwitcher /></div>
        <div style={{ width: 420, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
          <LogoMark />
          <div style={{ marginTop: 32, width: 80, height: 80, borderRadius: 20, background: tokens.accentSoft, border: `1px solid ${tokens.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📬</div>
          <h1 style={{ margin: '20px 0 8px', fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: '#fff' }}>{t('auth.forgotPassword.sentTitle')}</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            {t('auth.forgotPassword.sentSubtitle')}{' '}
            <span style={{ fontWeight: 700, color: '#fff' }}>{sentEmail}</span>
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t('auth.forgotPassword.sentHint')}</p>
          <Link to="/login" style={{ marginTop: 28, padding: '12px 24px', borderRadius: 12, background: tokens.accent, color: '#fff', textDecoration: 'none', fontFamily: tokens.font, fontSize: 14, fontWeight: 700 }}>
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </AuthBackground>
    )
  }

  return (
    <AuthBackground>
      <div style={{ position: 'absolute', top: 20, right: 24 }}><LanguageSwitcher /></div>
      <div style={{ width: 420, padding: '0 16px' }}>
        <LogoMark />
        <h1 style={{ margin: '24px 0 6px', fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: '#fff' }}>{t('auth.forgotPassword.title')}</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{t('auth.forgotPassword.subtitle')}</p>

        <form onSubmit={onSubmit} style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{t('auth.forgotPassword.email')}</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 12,
                border: `1.5px solid ${errors.email ? tokens.danger : 'rgba(255,255,255,0.15)'}`,
                background: 'rgba(255,255,255,0.07)', color: '#fff',
                fontFamily: tokens.font, fontSize: 14, outline: 'none',
              }}
            />
            {errors.email && <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{t(`auth.errors.${errors.email.message}`)}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} style={{
            padding: '14px 18px',
            background: tokens.accent, color: '#fff', border: 'none', borderRadius: 12,
            fontFamily: tokens.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}>
            {isSubmitting ? t('common.loading') : t('auth.forgotPassword.cta')}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <Link to="/login" style={{ fontSize: 13, color: tokens.accent, fontWeight: 600, textDecoration: 'none' }}>
            ← {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </AuthBackground>
  )
}
