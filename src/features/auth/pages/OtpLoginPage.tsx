import { useRef, useState } from 'react'
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
  const verifyingRef = useRef(false)
  const lastSubmittedRef = useRef('')

  const onRequest = async () => {
    setBusySend(true)
    try {
      await requestOtp()
      setSent(true)
      setCode('')
      lastSubmittedRef.current = ''
      toast.success('OTP sent to Telegram')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setBusySend(false)
    }
  }

  const onVerify = async (trimmed: string) => {
    if (verifyingRef.current || lastSubmittedRef.current === trimmed) return
    verifyingRef.current = true
    lastSubmittedRef.current = trimmed
    setBusyVerify(true)
    try {
      await verifyOtp(trimmed)
      toast.success('Signed in')
      navigate('/health', { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid OTP')
      setCode('')
      lastSubmittedRef.current = ''
    } finally {
      verifyingRef.current = false
      setBusyVerify(false)
    }
  }

  const onCodeChange = (next: string) => {
    const trimmed = next.replace(/\D/g, '').slice(0, 6)
    setCode(trimmed)
    if (trimmed.length === 6) {
      void onVerify(trimmed)
    }
  }

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
            disabled={busySend || busyVerify}
            onClick={() => void onRequest()}
          >
            {busySend ? 'Sending…' : sent ? 'Resend OTP' : 'Send OTP'}
          </button>

          <div>
            <span className="grg-label">Enter code</span>
            <OTPInput value={code} onChange={onCodeChange} disabled={busyVerify} />
            {busyVerify && (
              <p className="grg-hint" style={{ marginTop: 12, textAlign: 'center' }}>
                Verifying…
              </p>
            )}
          </div>
        </div>
      </div>
    </AuthShell>
  )
}
