import { useRef } from 'react'
import { tokens } from '@/shared/ui/tokens'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
}

export function OTPInput({ value, onChange }: OTPInputProps) {
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const next = digits.map((d, i) => (i === index ? char.slice(-1) : d))
    onChange(next.join(''))
    if (char && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const nextIndex = Math.min(pasted.length, 5)
    refs.current[nextIndex]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoFocus={i === 0}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 52, height: 60,
            borderRadius: 12,
            border: `1.5px solid ${i === value.length && value.length < 6 ? tokens.accent : d ? tokens.accent : tokens.borderStrong}`,
            boxShadow: i === value.length && value.length < 6 ? `0 0 0 4px ${tokens.accentSoft}` : 'none',
            background: d ? tokens.accentSoft : '#fff',
            fontFamily: tokens.mono, fontSize: 28, fontWeight: 700,
            color: d ? tokens.accent : tokens.ink,
            textAlign: 'center', outline: 'none',
          }}
        />
      ))}
    </div>
  )
}
