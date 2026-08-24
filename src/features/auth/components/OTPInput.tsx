import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  /** @deprecated GRG theme is always dark */
  tone?: 'light' | 'dark'
}

export function OTPInput({ value, onChange }: OTPInputProps) {
  const digits = value.replace(/\D/g, '').split('').concat(Array(6).fill('')).slice(0, 6)
  const refs = useRef<(HTMLInputElement | null)[]>([])
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
    <div className="grg-otp-row">
      {digits.map((d, i) => {
        const active = i === activeIndex && len < 6
        const filled = Boolean(d)
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
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
            className={`grg-otp-cell${active ? ' is-active' : ''}${filled ? ' is-filled' : ''}`}
          />
        )
      })}
    </div>
  )
}
