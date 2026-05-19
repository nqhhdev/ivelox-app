import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegisterForm } from '../hooks/useRegisterForm'
import { SocialButton } from '../components/SocialButton'
import { OrDivider } from '../components/OrDivider'
import { PasswordStrength } from '../components/PasswordStrength'
import { PasswordInput } from '../components/PasswordInput'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'
import { AuthBackground } from '@/shared/ui/AuthBackground'

export function RegisterPage() {
  const { t } = useTranslation()
  const { form, onSubmit, onGoogle } = useRegisterForm()
  const { register, watch, formState: { errors, isSubmitting } } = form
  const password = watch('password', '')

  const inputStyle = (err?: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${err ? tokens.danger : 'rgba(255,255,255,0.15)'}`,
    background: 'rgba(255,255,255,0.07)', color: '#fff',
    fontFamily: tokens.font, fontSize: 14, outline: 'none',
  })

  return (
    <AuthBackground>
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}><LanguageSwitcher /></div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 460, padding: '0 16px' }}>
        <LogoMark />
        <div style={{ marginTop: 22, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('auth.register.badge')}</div>
        <h1 style={{ margin: '6px 0 4px', fontSize: 28, fontWeight: 700, letterSpacing: -0.8, textAlign: 'center', color: '#fff' }}>{t('auth.register.title')}</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{t('auth.register.subtitle')}</p>

        <div style={{ marginTop: 28, width: '100%', background: 'rgba(15,10,26,0.55)', borderRadius: 18, padding: 28, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(28px) saturate(140%)', boxShadow: '0 24px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(170,59,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
          <SocialButton onClick={onGoogle} loading={isSubmitting} />
          <div style={{ margin: '18px 0' }}><OrDivider /></div>

          <form onSubmit={onSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{t('auth.register.email')}</label>
              <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="off" style={inputStyle(!!errors.email)} />
              {errors.email && <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{t(`auth.errors.${errors.email.message}`)}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{t('auth.register.password')}</label>
              <PasswordInput
                registration={register('password')}
                placeholder={t('auth.register.passwordPlaceholder')}
                hasError={!!errors.password}
                tone="dark"
                style={inputStyle(!!errors.password)}
              />
              <PasswordStrength password={password} />
              {errors.password && <p style={{ fontSize: 12, color: tokens.danger, marginTop: 4 }}>{t(`auth.errors.${errors.password.message}`)}</p>}
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" {...register('agreeTerms')} style={{ accentColor: tokens.accent, marginTop: 2, flexShrink: 0 }} />
              <span>
                {t('auth.register.agreeTerms')}{' '}
                <Link to="#" style={{ color: tokens.accent, fontWeight: 600, textDecoration: 'none' }}>{t('common.terms')}</Link>
                {' '}{t('auth.register.and')}{' '}
                <Link to="#" style={{ color: tokens.accent, fontWeight: 600, textDecoration: 'none' }}>{t('common.privacy')}</Link>
              </span>
            </label>
            {errors.agreeTerms && <p style={{ fontSize: 12, color: tokens.danger }}>{t('auth.errors.agreeTermsRequired')}</p>}
            <button type="submit" disabled={isSubmitting} style={{
              padding: '14px 18px', marginTop: 4,
              background: tokens.accent, color: '#fff', border: 'none', borderRadius: 12,
              fontFamily: tokens.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(170,59,255,0.30)',
              opacity: isSubmitting ? 0.7 : 1,
            }}>
              {isSubmitting ? t('common.loading') : t('auth.register.cta')}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.register.alreadyAccount')}{' '}
          <Link to="/login" style={{ color: tokens.accent, fontWeight: 700, textDecoration: 'none' }}>{t('auth.login.signIn')}</Link>
        </div>
      </div>
    </AuthBackground>
  )
}
