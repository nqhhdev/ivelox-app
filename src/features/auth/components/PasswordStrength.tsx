import { useTranslation } from 'react-i18next'
import { tokens } from '@/shared/ui/tokens'

interface PasswordStrengthProps {
  password: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: '', color: tokens.border }
  let score = 0
  if (password.length >= 8) score++
  if (/[0-9]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const map = [
    { score: 1, label: 'strengthWeak', color: '#ef4444' },
    { score: 2, label: 'strengthFair', color: '#f59e0b' },
    { score: 3, label: 'strengthGood', color: '#3b82f6' },
    { score: 4, label: 'strengthStrong', color: '#22c55e' },
  ]
  return map[Math.min(score - 1, 3)] ?? { score: 0, label: '', color: tokens.border }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation()
  const { score, label, color } = getStrength(password)
  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 999,
            background: i < score ? color : tokens.border,
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {label && (
        <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 4 }}>
          {t(`auth.register.${label}`)}
        </div>
      )}
    </div>
  )
}
