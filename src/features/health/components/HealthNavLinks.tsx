import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/health', label: 'Board' },
  { to: '/health/weekly', label: 'Weekly' },
] as const

export function HealthNavLinks({ active }: { active?: string }) {
  return (
    <>
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          style={active === l.to || (l.to === '/health' && active?.startsWith('/health') && active !== '/health/weekly')
            ? { color: 'var(--grg-title, #75d18c)' }
            : undefined}
        >
          {l.label}
        </Link>
      ))}
    </>
  )
}
