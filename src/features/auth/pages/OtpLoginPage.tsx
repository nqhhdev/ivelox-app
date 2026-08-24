import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { OTPInput } from '@/features/auth/components/OTPInput'
import { LogoMark } from '@/shared/ui/LogoMark'
import { tokens } from '@/shared/ui/tokens'
import { useAuthStore } from '@/shared/hooks/useAuth'

export function OtpLoginPage() {
  const navigate = useNavigate()
  const requestOtp = useAuthStore((s) => s.requestOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busySend, setBusySend] = useState(false)
  const [busyVerify, setBusyVerify] = useState(false)

  const onRequest = async () => {
    setBusySend(true)
    try {
      await requestOtp()
      setSent(true)
      setCode('')
      toast.success('OTP sent to Telegram')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setBusySend(false)
    }
  }

  const onVerify = async () => {
    const trimmed = code.replace(/\D/g, '').slice(0, 6)
    if (trimmed.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    setBusyVerify(true)
    try {
      await verifyOtp(trimmed)
      toast.success('Signed in')
      navigate('/health', { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP')
    } finally {
      setBusyVerify(false)
    }
  }

  return (
    <AuthShell tone="dark">
      <div style={{ width: '100%', maxWidth: 420, padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <LogoMark />
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, letterSpacing: -0.8 }}>
          Owner login
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          Tap Send OTP, then enter the 6-digit code from Telegram.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button
            type="button"
            disabled={busySend}
            onClick={() => void onRequest()}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 12,
              border: 'none',
              background: tokens.accent,
              color: '#fff',
              fontFamily: tokens.font,
              fontSize: 15,
              fontWeight: 700,
              cursor: busySend ? 'wait' : 'pointer',
              opacity: busySend ? 0.7 : 1,
            }}
          >
            {busySend ? 'Sending…' : sent ? 'Resend OTP' : 'Send OTP'}
          </button>

          <div>
            <label
              htmlFor="otp-code"
              style={{
                display: 'block',
                marginBottom: 12,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Enter code
            </label>
            <OTPInput value={code} onChange={setCode} tone="dark" />
            {/* Fallback single field for paste / password managers */}
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="otp"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              aria-label="6-digit OTP"
              style={{
                marginTop: 14,
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontFamily: tokens.mono,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 8,
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="button"
            disabled={busyVerify || code.replace(/\D/g, '').length !== 6}
            onClick={() => void onVerify()}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 12,
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: '#fff',
              fontFamily: tokens.font,
              fontSize: 15,
              fontWeight: 700,
              cursor: busyVerify ? 'wait' : 'pointer',
              opacity: busyVerify || code.replace(/\D/g, '').length !== 6 ? 0.45 : 1,
            }}
          >
            {busyVerify ? 'Verifying…' : 'Verify & sign in'}
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
