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

export function LanguageSwitcher({ dark = false }: LanguageSwitcherProps) {
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

  const btnStyle: React.CSSProperties = dark
    ? {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '6px 10px 6px 8px', borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(6px)',
        color: '#fff', cursor: 'pointer',
        fontFamily: tokens.font, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
      }
    : {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 8,
        border: `1px solid ${tokens.border}`,
        background: '#fff', color: tokens.ink,
        fontFamily: tokens.font, fontSize: 12, fontWeight: 700,
        cursor: 'pointer', letterSpacing: 0.3,
      }

  const dropdownStyle: React.CSSProperties = dark
    ? {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        width: 200, zIndex: 50,
        background: 'rgba(15,10,26,0.92)',
        backdropFilter: 'blur(20px) saturate(140%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        padding: 6,
      }
    : {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        width: 200, zIndex: 50,
        background: '#fff',
        border: `1px solid ${tokens.border}`,
        borderRadius: 14,
        boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
        padding: 6,
      }

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
    background: active ? (dark ? 'rgba(170,59,255,0.18)' : tokens.accentSoft) : 'transparent',
    border: 'none', fontFamily: tokens.font, textAlign: 'left',
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={btnStyle}>
        <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
        <span>{currentLang.code.toUpperCase()}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.6)' : tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <div style={{ fontSize: 12, fontWeight: 600, color: dark ? '#fff' : tokens.ink }}>{l.name}</div>
                <div style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.5)' : tokens.muted }}>{l.sub}</div>
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
