import { Link, NavLink, useLocation } from 'react-router-dom'
import { portfolioContent } from '@/features/portfolio/content'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { usePlatformFeatures } from '@/shared/hooks/usePlatformFeatures'

const NAV = [
  { to: '/', label: 'Work' },
  { to: '/oss', label: 'OSS' },
  { to: '/blog', label: 'Blog' },
  { to: '/now', label: 'Now' },
] as const

export function PortfolioShell({
  children,
  article = false,
}: {
  children: React.ReactNode
  article?: boolean
}) {
  const location = useLocation()
  const { data: features } = usePlatformFeatures()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)
  const healthEnabled = features?.health.enabled !== false
  const githubUrl = `https://github.com/${portfolioContent.githubUser}`
  const mailto = `mailto:${portfolioContent.email}?subject=${encodeURIComponent('Project inquiry — Flutter production')}`

  return (
    <div className="grg-page">
      <header className="grg-top">
        <Link to="/" className="grg-brand">
          {portfolioContent.brand}
        </Link>
        <nav>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const workActive = item.to === '/' && location.pathname.startsWith('/work/')
                return isActive || workActive ? 'is-active' : undefined
              }}
            >
              {item.label}
            </NavLink>
          ))}
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={mailto}>Contact</a>
          {healthEnabled && (
            <Link to={isAuthenticated ? '/health' : '/login'}>
              {isAuthenticated ? 'Health' : 'Sign in'}
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" onClick={signOut}>
              Sign out
            </button>
          )}
        </nav>
      </header>
      <main className={article ? 'grg-matrioska grg-matrioska--article' : 'grg-matrioska'}>
        {children}
      </main>
    </div>
  )
}
