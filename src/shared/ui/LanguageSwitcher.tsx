import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { tokens } from './tokens'
import type { SupportedLang } from '../i18n/index'

interface LanguageSwitcherProps {
  dark?: boolean
}

const LANGUAGES: { code: SupportedLang; flag: string; name: string; sub: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'English' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', sub: 'Tiếng Việt' },
]

export function LanguageSwitcher({ dark = true }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language as SupportedLang
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentLang = LANGUAGES.find(l => l.code === current) ?? LANGUAGES[0]

  const changeLang = (code: SupportedLang) => {
    i18n.changeLanguage(code)
    localStorage.setItem('i18n_lang', code)
    setOpen(false)
  }

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 10px',
    borderRadius: 2,
    background: dark ? 'rgba(11, 57, 84, 0.35)' : '#fff',
    border: `1px solid ${dark ? tokens.border : tokens.border}`,
    color: dark ? tokens.ink : tokens.ink,
    cursor: 'pointer',
    fontFamily: tokens.font,
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 0.06,
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    width: 200,
    zIndex: 50,
    background: tokens.bg,
    border: `1px solid ${tokens.border}`,
    borderRadius: 2,
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    padding: 6,
  }

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 2,
    cursor: 'pointer',
    background: active ? tokens.accentSoft : 'transparent',
    border: 'none',
    fontFamily: tokens.font,
    textAlign: 'left',
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={btnStyle}>
        <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
        <span>{currentLang.code.toUpperCase()}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={dropdownStyle}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLang(l.code)}
              style={itemStyle(l.code === current)}
            >
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: tokens.ink }}>{l.name}</div>
                <div style={{ fontSize: 10, color: tokens.muted }}>{l.sub}</div>
              </div>
              {l.code === current && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
