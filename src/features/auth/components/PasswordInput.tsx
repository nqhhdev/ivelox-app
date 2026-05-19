import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
)

interface PasswordInputProps {
  registration: UseFormRegisterReturn
  placeholder?: string
  style?: React.CSSProperties
  hasError?: boolean
  tone?: 'dark' | 'light'
}

export function PasswordInput({ registration, placeholder = '••••••••', style = {}, hasError = false, tone = 'dark' }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const iconColor = hasError ? '#ef4444' : tone === 'dark' ? 'rgba(255,255,255,0.4)' : '#9ca3af'

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...registration}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete="new-password"
        style={{
          width: '100%', boxSizing: 'border-box',
          paddingRight: 44,
          ...style,
        }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: iconColor,
          display: 'flex', alignItems: 'center',
        }}
        tabIndex={-1}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  )
}
