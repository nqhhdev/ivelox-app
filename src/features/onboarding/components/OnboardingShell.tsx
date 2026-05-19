import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LogoMark } from '@/shared/ui/LogoMark'
import { LanguageSwitcher } from '@/shared/ui/LanguageSwitcher'
import { tokens } from '@/shared/ui/tokens'

interface OnboardingShellProps {
  step: 1 | 2 | 3 | 4
  children: ReactNode
  onSkip?: () => void
}

export function OnboardingShell({ step, children, onSkip }: OnboardingShellProps) {
  const { t } = useTranslation()
  const stepLabels = t('onboarding.shell.steps', { returnObjects: true }) as string[]

  return (
    <div style={{ minHeight: '100vh', background: tokens.bg, fontFamily: tokens.font, color: tokens.ink, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${tokens.border}`, background: '#fff', flexShrink: 0 }}>
        <LogoMark />
        <div style={{ flex: 1 }} />

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {([1, 2, 3, 4] as const).map((n) => {
            const done = n < step
            const cur = n === step
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: done || cur ? tokens.accent : '#fff',
                    color: done || cur ? '#fff' : tokens.muted,
                    border: cur ? `2px solid ${tokens.accent}` : done ? 'none' : `1px solid ${tokens.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, fontFamily: tokens.mono,
                    boxShadow: cur ? `0 0 0 4px ${tokens.accent}1a` : 'none',
                    flexShrink: 0,
                  }}>
                    {done ? '✓' : n}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: cur ? 700 : 500, color: cur ? tokens.ink : tokens.muted }}>
                    {stepLabels[n - 1]}
                  </span>
                </div>
                {n < 4 && (
                  <div style={{ width: 28, height: 2, borderRadius: 999, background: done ? tokens.accent : tokens.border }} />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
          <LanguageSwitcher />
          {step < 4 && onSkip && (
            <button onClick={onSkip} style={{ fontSize: 13, color: tokens.muted, fontWeight: 600, padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: tokens.font }}>
              {t('common.skip')}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 40px 60px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
