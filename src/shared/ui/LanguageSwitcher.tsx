import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { tokens } from './tokens'
import type { SupportedLang } from '../i18n/index'

interface LanguageSwitcherProps {
  dark?: boolean
}

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'English' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', sub: 'Tiếng Việt' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', sub: '中文' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', sub: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', sub: '한국어' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', sub: 'ไทย' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', sub: 'Bahasa' },
]

const SUPPORTED: SupportedLang[] = ['en', 'vi']

export function LanguageSwitcher({ dark = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language as SupportedLang
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const recent = LANGUAGES.filter(l => l.code === 'en' || l.code === 'vi')
  const filtered = LANGUAGES.filter(
    l => l.name.toLowerCase().includes(search.toLowerCase()) || l.sub.toLowerCase().includes(search.toLowerCase())
  )

  const changeLang = (code: string) => {
    const lang: SupportedLang = SUPPORTED.includes(code as SupportedLang) ? (code as SupportedLang) : 'en'
    i18n.changeLanguage(lang)
    localStorage.setItem('i18n_lang', lang)
    setOpen(false)
    setSearch('')
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
        width: 240, zIndex: 50,
        background: 'rgba(15,10,26,0.92)',
        backdropFilter: 'blur(20px) saturate(140%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 14,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        padding: 6,
      }
    : {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        width: 240, zIndex: 50,
        background: '#fff',
        border: `1px solid ${tokens.border}`,
        borderRadius: 14,
        boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
        padding: 6,
      }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
    padding: '6px 10px 4px',
    color: dark ? 'rgba(255,255,255,0.4)' : tokens.muted,
  }

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
    background: active
      ? (dark ? 'rgba(170,59,255,0.18)' : tokens.accentSoft)
      : 'transparent',
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={btnStyle}>
        <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
        <span>{currentLang.code.toUpperCase()}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.6)' : tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={dropdownStyle}>
          {/* Search */}
          <div style={{ position: 'relative', padding: '4px 4px 6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={dark ? 'rgba(255,255,255,0.4)' : tokens.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language…"
              autoFocus
              style={{
                width: '100%', padding: '8px 10px 8px 30px',
                background: dark ? 'rgba(255,255,255,0.05)' : tokens.bg,
                border: dark ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${tokens.border}`,
                borderRadius: 10, outline: 'none',
                color: dark ? '#fff' : tokens.ink,
                fontFamily: tokens.font, fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {!search && (
            <>
              <div style={sectionLabelStyle}>Recent</div>
              {recent.map(l => (
                <div key={l.code} onClick={() => changeLang(l.code)} style={itemStyle(l.code === current)}>
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
                </div>
              ))}
              <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.08)' : tokens.border, margin: '4px 6px' }} />
              <div style={sectionLabelStyle}>All languages · {LANGUAGES.length}</div>
            </>
          )}

          {(search ? filtered : LANGUAGES.filter(l => l.code !== 'en' && l.code !== 'vi')).map(l => (
            <div key={l.code} onClick={() => changeLang(l.code)} style={itemStyle(l.code === current)}>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
