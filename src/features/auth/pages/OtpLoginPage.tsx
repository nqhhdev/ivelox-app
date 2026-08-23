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
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  const onRequest = async () => {
    setBusy(true)
    try {
      await requestOtp()
      setStep('verify')
      toast.success('OTP sent to Telegram')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  const onVerify = async () => {
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code')
      return
    }
    setBusy(true)
    try {
      await verifyOtp(code)
      toast.success('Signed in')
      navigate('/health', { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP')
    } finally {
      setBusy(false)
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
          One-time code via Telegram. No password, no Google.
        </p>

        {step === 'request' ? (
          <button
            type="button"
            disabled={busy}
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
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Sending…' : 'Send OTP'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <OTPInput value={code} onChange={setCode} />
            <button
              type="button"
              disabled={busy || code.length !== 6}
              onClick={() => void onVerify()}
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
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy || code.length !== 6 ? 0.6 : 1,
              }}
            >
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onRequest()}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.45)',
                fontFamily: tokens.font,
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Resend code
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
