import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/health', label: 'Today' },
  { to: '/health/log', label: 'Log' },
  { to: '/health/burns', label: 'Burns' },
  { to: '/health/body', label: 'Body' },
  { to: '/health/goals', label: 'Goals' },
  { to: '/health/weekly', label: 'Weekly' },
] as const

export function HealthNavLinks({ active }: { active?: string }) {
  return (
    <>
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          style={active === l.to ? { color: 'var(--grg-title, #75d18c)' } : undefined}
        >
          {l.label}
        </Link>
      ))}
    </>
  )
}
