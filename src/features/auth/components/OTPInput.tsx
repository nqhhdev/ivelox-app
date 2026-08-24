import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { tokens } from '@/shared/ui/tokens'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  tone?: 'light' | 'dark'
}

export function OTPInput({ value, onChange, tone = 'light' }: OTPInputProps) {
  const digits = value.replace(/\D/g, '').split('').concat(Array(6).fill('')).slice(0, 6)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const dark = tone === 'dark'
  const len = value.replace(/\D/g, '').length
  const activeIndex = Math.min(len, 5)

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const next = digits.map((d, i) => (i === index ? char.slice(-1) : d))
    onChange(next.join('').replace(/\D/g, '').slice(0, 6))
    if (char && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const nextIndex = Math.min(Math.max(pasted.length - 1, 0), 5)
    refs.current[nextIndex]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, i) => {
        const active = i === activeIndex && len < 6
        const border = active || d
          ? (dark ? '#7ec8c8' : tokens.accent)
          : (dark ? 'rgba(255,255,255,0.22)' : tokens.borderStrong)
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`OTP digit ${i + 1}`}
            maxLength={1}
            value={d}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: 48,
              height: 56,
              borderRadius: 12,
              border: `1.5px solid ${border}`,
              boxShadow: active
                ? (dark ? '0 0 0 3px rgba(126,200,200,0.25)' : `0 0 0 4px ${tokens.accentSoft}`)
                : 'none',
              background: d
                ? (dark ? 'rgba(126,200,200,0.15)' : tokens.accentSoft)
                : (dark ? 'rgba(255,255,255,0.06)' : '#fff'),
              fontFamily: tokens.mono,
              fontSize: 24,
              fontWeight: 700,
              color: d
                ? (dark ? '#7ec8c8' : tokens.accent)
                : (dark ? 'rgba(255,255,255,0.85)' : tokens.ink),
              textAlign: 'center',
              outline: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
