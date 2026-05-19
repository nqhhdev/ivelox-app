import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/api/supabase'
import { useOnboardingStore } from '@/features/onboarding/hooks/useOnboardingStore'
import { LogoMark } from '@/shared/ui/LogoMark'
import { tokens } from '@/shared/ui/tokens'

type Status = 'loading' | 'verified' | 'error'

export default function CallbackPage() {
  const navigate = useNavigate()
  const { isComplete } = useOnboardingStore()
  const [status, setStatus] = useState<Status>('loading')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const handleVerified = async (userId: string) => {
      sessionStorage.removeItem('pending_verify_email')

      // Broadcast to VerifyEmailPage on any device/tab that email is confirmed
      const channel = supabase.channel(`email-verified:${userId}`)
      await channel.subscribe()
      channel.send({ type: 'broadcast', event: 'verified', payload: {} })
      // Small delay to ensure message is delivered before we leave
      setTimeout(() => supabase.removeChannel(channel), 1000)

      setStatus('verified')
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        handleVerified(session.user.id)
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        setStatus('error')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleVerified(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  // countdown + auto-navigate after verified
  useEffect(() => {
    if (status !== 'verified') return
    if (countdown <= 0) {
      navigate(isComplete ? '/' : '/onboarding/welcome', { replace: true })
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [status, countdown, navigate, isComplete])

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tokens.bg, fontFamily: tokens.font,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            border: `3px solid ${tokens.accent}`,
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontSize: 14, color: tokens.muted }}>Verifying your account…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: tokens.bg, fontFamily: tokens.font,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: tokens.ink, margin: '0 0 8px' }}>Link expired or invalid</h1>
          <p style={{ fontSize: 14, color: tokens.text, margin: '0 0 24px' }}>
            The verification link may have expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/register', { replace: true })}
            style={{
              padding: '12px 24px', borderRadius: 12,
              background: tokens.accent, color: '#fff', border: 'none',
              fontFamily: tokens.font, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Back to Register
          </button>
        </div>
      </div>
    )
  }

  // verified
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      fontFamily: tokens.font, color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 53 + 17) % 100
          const y = (i * 79 + 31) % 100
          const col = ['#aa3bff', '#fbbf24', '#22c55e', '#3b82f6', '#f97316'][i % 5]
          return <rect key={i} x={`${x}%`} y={`${y}%`} width="8" height="3" fill={col} transform={`rotate(${i * 30})`} opacity="0.8" />
        })}
      </svg>

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <LogoMark />

        {/* Verified icon */}
        <div style={{
          margin: '32px auto 0',
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 48px rgba(34,197,94,0.45)',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 24, padding: '4px 14px', borderRadius: 999,
          background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.35)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: '#22c55e' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Account Verified
          </span>
        </div>

        <h1 style={{ margin: '16px 0 10px', fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
          You're all set! 🎉
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          Your email has been verified. Let's set up your profile and get your first band estimate.
        </p>

        {/* XP earned */}
        <div style={{
          margin: '28px auto 0', display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 14,
          background: 'rgba(251,191,36,0.14)', border: '1px solid rgba(251,191,36,0.30)',
        }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Reward</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', fontFamily: tokens.mono, letterSpacing: -0.5 }}>+50 XP</div>
          </div>
        </div>

        {/* Auto-continue button */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => navigate(isComplete ? '/' : '/onboarding/welcome', { replace: true })}
            style={{
              padding: '14px 36px', borderRadius: 14,
              background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
              color: '#fff', border: 'none',
              fontFamily: tokens.font, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 16px 40px rgba(170,59,255,0.5)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            Continue setup
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: 999,
              background: 'rgba(255,255,255,0.20)',
              fontSize: 13, fontWeight: 800, fontFamily: tokens.mono,
            }}>
              {countdown}
            </span>
          </button>
        </div>

        <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Auto-continuing in {countdown}s…
        </p>
      </div>
    </div>
  )
}
