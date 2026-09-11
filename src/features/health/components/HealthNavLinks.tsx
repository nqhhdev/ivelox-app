import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/health', label: 'Board' },
  { to: '/health/history', label: 'History' },
] as const

export function HealthNavLinks({ active }: { active?: string }) {
  return (
    <>
      {LINKS.map((l) => {
        const onBoard =
          l.to === '/health' &&
          active?.startsWith('/health') &&
          active !== '/health/history' &&
          active !== '/health/weekly'
        const isActive = active === l.to || onBoard
        return (
          <Link
            key={l.to}
            to={l.to}
            style={isActive ? { color: 'var(--grg-title, #1f7a4c)' } : undefined}
          >
            {l.label}
          </Link>
        )
      })}
    </>
  )
}
