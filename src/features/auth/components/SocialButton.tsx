import { useTranslation } from 'react-i18next'
import { tokens } from '@/shared/ui/tokens'

interface SocialButtonProps {
  onClick?: () => void
  loading?: boolean
  dark?: boolean
}

const GoogleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.63z" fill="#4285F4" />
    <path d="M9 18a8.59 8.59 0 0 0 5.96-2.18l-2.92-2.26a5.41 5.41 0 0 1-8.06-2.84H.99v2.33A8.99 8.99 0 0 0 9 18z" fill="#34A853" />
    <path d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H.99A9 9 0 0 0 0 9c0 1.45.35 2.82.99 4.05l2.99-2.33z" fill="#FBBC05" />
    <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8.99 8.99 0 0 0 .99 4.95L3.98 7.28A5.36 5.36 0 0 1 9 3.58z" fill="#EA4335" />
  </svg>
)

export function SocialButton({ onClick, loading = false, dark = false }: SocialButtonProps) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '12px 16px', width: '100%',
        background: '#fff', color: tokens.ink,
        border: dark ? 'none' : `1px solid ${tokens.border}`,
        borderRadius: 12,
        fontFamily: tokens.font, fontWeight: 600, fontSize: 14,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {GoogleIcon}
      {t('auth.social.google')}
    </button>
  )
}
