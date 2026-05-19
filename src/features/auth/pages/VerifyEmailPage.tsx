import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { OTPInput } from '../components/OTPInput'
import { useToast } from '@/shared/hooks/useToast'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'
import { AuthBackground } from '@/shared/ui/AuthBackground'
import { supabase } from '@/shared/api/supabase'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useOnboardingStore } from '@/features/onboarding/hooks/useOnboardingStore'

// cooldown: seconds user must wait before resending
function useResendCooldown(cooldownSeconds = 60) {
  const [remaining, setRemaining] = useState(0)
  useEffect(() => {
    if (remaining <= 0) return
    const timer = setInterval(() => setRemaining(r => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remaining])
  const start = () => setRemaining(cooldownSeconds)
  const canResend = remaining <= 0
  const fmt = remaining > 0 ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : ''
  return { canResend, fmt, start }
}

export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'otp' ? 'otp' : 'link'
  const { user } = useAuthStore()
  const email = user?.email ?? sessionStorage.getItem('pending_verify_email') ?? ''
  const userId = user?.id ?? null

  if (mode === 'otp') return <OTPMode email={email} />
  return <LinkMode email={email} userId={userId} />
}

function LinkMode({ email, userId }: { email: string; userId: string | null }) {
  const { t } = useTranslation()
  const { canResend, fmt, start } = useResendCooldown(60)
  const toast = useToast()
  const navigate = useNavigate()
  const { isComplete } = useOnboardingStore()

  const handleVerified = () => {
    sessionStorage.removeItem('pending_verify_email')
    navigate(isComplete ? '/' : '/onboarding/welcome', { replace: true })
  }

  // Listen for session from same browser (other tab clicked email link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        handleVerified()
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate, isComplete])

  // Realtime broadcast: instant cross-device detection when /callback fires
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    let fallbackInterval: ReturnType<typeof setInterval> | null = null

    const startFallbackPoll = () => {
      if (fallbackInterval) return
      fallbackInterval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email_confirmed_at) {
          if (fallbackInterval) clearInterval(fallbackInterval)
          handleVerified()
        }
      }, 5000)
    }

    const subscribe = (id: string) => {
      channel = supabase
        .channel(`email-verified:${id}`)
        .on('broadcast', { event: 'verified' }, () => handleVerified())
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') startFallbackPoll()
        })
    }

    if (userId) {
      subscribe(userId)
    } else {
      // userId not yet in store — fetch from session directly
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user.id) subscribe(session.user.id)
      })
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (fallbackInterval) clearInterval(fallbackInterval)
    }
  }, [userId, navigate, isComplete])

  const handleResend = async () => {
    if (!email || !canResend) return
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      start()
      toast.success('Verification email resent!')
    } catch (e) {
      toast.error(e, 'Failed to resend email.')
    }
  }

  return (
    <AuthBackground>
      <div style={{ position: 'absolute', top: 20, right: 24 }}><LanguageSwitcher /></div>

      <div style={{ position: 'relative', width: 480, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
        <LogoMark />

        {/* Email icon hero */}
        <div style={{ marginTop: 32, width: 120, height: 120, borderRadius: 24, background: 'linear-gradient(135deg, #faf5ff, #fff)', border: `1px solid ${tokens.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="6" y="14" width="44" height="32" rx="4" fill="#fff" stroke="#aa3bff" strokeWidth="2" />
            <path d="M6 14l22 18 22-18" stroke="#aa3bff" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="44" cy="14" r="8" fill="#aa3bff" />
            <path d="M40 14l3 3 5-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ position: 'absolute', top: -6, right: -10, fontSize: 18 }}>✨</span>
        </div>

        <h1 style={{ margin: '24px 0 8px', fontSize: 30, fontWeight: 700, letterSpacing: -0.9, color: '#fff' }}>{t('auth.verifyEmail.title')}</h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: 400 }}>
          {t('auth.verifyEmail.subtitle')}{' '}
          <span style={{ color: '#fff', fontWeight: 700, background: tokens.accentSoft, padding: '2px 8px', borderRadius: 6, fontFamily: tokens.mono, fontSize: 13 }}>{email}</span>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t('auth.verifyEmail.hint')}</p>

        {/* Status card */}
        <div style={{ marginTop: 28, width: '100%', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: '#22c55e' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t('auth.verifyEmail.waiting')}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: tokens.mono, marginTop: 2 }}>
              {t('auth.verifyEmail.waitingHint')} {fmt}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleResend}
            disabled={!canResend}
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
              fontFamily: tokens.font, fontSize: 13, fontWeight: 600,
              color: canResend ? '#fff' : 'rgba(255,255,255,0.45)',
              cursor: canResend ? 'pointer' : 'not-allowed',
              opacity: canResend ? 1 : 0.6,
            }}
          >
            🔄 {t('auth.verifyEmail.resend')}{fmt ? ` (${fmt})` : ''}
          </button>
          <Link to="/register" style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', fontFamily: tokens.font, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            {t('auth.verifyEmail.differentEmail')}
          </Link>
        </div>

        {/* Next up teaser */}
        <div style={{ marginTop: 28, padding: 16, background: tokens.accentSoft, border: `1px solid ${tokens.accentBorder}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: tokens.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{t('auth.verifyEmail.nextUp')}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 1 }}>{t('auth.verifyEmail.nextUpDesc')}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          {t('auth.verifyEmail.cantFind')}{' '}
          <a href="https://gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: tokens.accent, fontWeight: 700 }}>{t('auth.verifyEmail.openGmail')}</a>
        </div>
      </div>
    </AuthBackground>
  )
}

function OTPMode({ email }: { email: string }) {
  const { t } = useTranslation()
  const { canResend, fmt, start: startCooldown } = useResendCooldown(60)
  const [otpValue, setOtpValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length < 6) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.verifyOtp({ email, token: otpValue, type: 'signup' })
      if (err) throw err
      toast.success('Email verified! Welcome to iVelox.')
    } catch (e) {
      const msg = toast.error(e, t('common.error'))
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthBackground>
      <div style={{ position: 'absolute', top: 20, right: 24 }}><LanguageSwitcher /></div>
      <div style={{ width: 460, background: 'rgba(15,10,26,0.55)', borderRadius: 22, padding: 36, border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(28px)', boxShadow: '0 24px 60px rgba(0,0,0,0.40), 0 0 0 1px rgba(170,59,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        <LogoMark />
        <h1 style={{ margin: '20px 0 6px', fontSize: 26, fontWeight: 700, letterSpacing: -0.7, color: '#fff' }}>{t('auth.verifyEmail.otpTitle')}</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.verifyEmail.otpSubtitle')}{' '}
          <span style={{ color: '#fff', fontWeight: 700 }}>{email}</span>
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
          <OTPInput value={otpValue} onChange={setOtpValue} />
          {error && <p style={{ fontSize: 12, color: tokens.danger, textAlign: 'center', marginTop: 12 }}>{error}</p>}
          <button type="submit" disabled={loading || otpValue.length < 6} style={{
            width: '100%', padding: '14px 18px', marginTop: 28,
            background: tokens.accent, color: '#fff', border: 'none', borderRadius: 12,
            fontFamily: tokens.font, fontSize: 15, fontWeight: 700, cursor: 'pointer',
            opacity: (loading || otpValue.length < 6) ? 0.6 : 1,
          }}>
            {loading ? t('common.loading') : t('auth.verifyEmail.otpCta')}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {t('auth.verifyEmail.otpDidntGet')}{' '}
          <button onClick={startCooldown} disabled={!canResend} style={{ color: canResend ? tokens.accent : 'rgba(255,255,255,0.45)', fontWeight: 700, background: 'none', border: 'none', cursor: canResend ? 'pointer' : 'not-allowed', fontFamily: tokens.font, fontSize: 13 }}>
            {t('auth.verifyEmail.otpResend')}{fmt ? ` (${fmt})` : ''}
          </button>
        </div>
      </div>
    </AuthBackground>
  )
}
