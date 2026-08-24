import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { OTPInput } from '@/features/auth/components/OTPInput'
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

  const canVerify = code.replace(/\D/g, '').length === 6

  return (
    <AuthShell>
      <div className="grg-narrow grg-narrow-sm" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <p className="grg-eyebrow">Access</p>
        <h1>Owner login</h1>
        <p className="grg-lead">
          Tap Send OTP, then enter the 6-digit code from Telegram.
        </p>

        <div className="grg-stack">
          <button
            type="button"
            className="grg-btn grg-btn--block"
            disabled={busySend}
            onClick={() => void onRequest()}
          >
            {busySend ? 'Sending…' : sent ? 'Resend OTP' : 'Send OTP'}
          </button>

          <div>
            <label htmlFor="otp-code" className="grg-label">
              Enter code
            </label>
            <OTPInput value={code} onChange={setCode} />
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
              className="grg-input grg-input--otp"
              style={{ marginTop: 14 }}
            />
          </div>

          <button
            type="button"
            className="grg-btn grg-btn--ghost grg-btn--block"
            disabled={busyVerify || !canVerify}
            onClick={() => void onVerify()}
          >
            {busyVerify ? 'Verifying…' : 'Verify & sign in'}
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
