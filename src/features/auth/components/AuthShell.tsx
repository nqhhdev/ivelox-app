import { type ReactNode } from 'react'
import { BrandOrnament } from '@/shared/ui/BrandOrnament'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'

interface AuthShellProps {
  children: ReactNode
  tone?: 'light' | 'dark'
  centered?: boolean
}

export function AuthShell({ children, tone = 'light', centered = true }: AuthShellProps) {
  const isDark = tone === 'dark'
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: isDark
        ? 'radial-gradient(ellipse at 30% 20%, #2a1456 0%, #0f0a1a 60%)'
        : tokens.bg,
      fontFamily: tokens.font,
      color: isDark ? '#fff' : tokens.ink,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {!isDark && <BrandOrnament tone={tone} />}
      {isDark && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      )}

      {/* Language switcher — top right */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
        <LanguageSwitcher />
      </div>

      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: centered ? 'center' : 'flex-start',
      }}>
        {children}
      </div>
    </div>
  )
}
