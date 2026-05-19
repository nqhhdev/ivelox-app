import { useTranslation } from 'react-i18next'
import { tokens } from '@/shared/ui/tokens'

interface OrDividerProps {
  dark?: boolean
}

export function OrDivider({ dark = false }: OrDividerProps) {
  const { t } = useTranslation()
  const line = dark ? 'rgba(255,255,255,0.10)' : tokens.border
  const text = dark ? 'rgba(255,255,255,0.4)' : tokens.muted
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: line }} />
      <span style={{ fontSize: 11, color: text, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: tokens.mono }}>
        {t('common.or')}
      </span>
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  )
}
