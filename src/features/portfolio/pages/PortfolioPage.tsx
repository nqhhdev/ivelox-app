import { Link } from 'react-router-dom'
import { portfolioContent } from '@/features/portfolio/content'
import {
  useGithubProfile,
  usePortfolioProjects,
} from '@/features/portfolio/hooks/usePortfolioProjects'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { usePlatformFeatures } from '@/shared/hooks/usePlatformFeatures'
import './portfolio.css'

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Java: '#b07219',
  Go: '#00ADD8',
  Python: '#3572A5',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function PortfolioPage() {
  const { data: profile, isLoading: profileLoading } = useGithubProfile()
  const { data: projects = [], isLoading: reposLoading } = usePortfolioProjects()
  const { data: features } = usePlatformFeatures()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)
  const healthEnabled = features?.health.enabled !== false

  const displayName = profile?.name ?? portfolioContent.githubUser
  const blogHref = profile?.blog
    ? (profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`)
    : null

  return (
    <div className="gh-page">
      <header className="gh-header">
        <Link to="/" className="gh-brand">{portfolioContent.brand}</Link>
        <nav className="gh-nav">
          <a href={`https://github.com/${portfolioContent.githubUser}`} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {healthEnabled && (
            <Link to={isAuthenticated ? '/health' : '/login'}>
              {isAuthenticated ? 'Health' : 'Sign in'}
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" onClick={signOut}>Sign out</button>
          )}
        </nav>
      </header>

      <div className="gh-layout">
        <aside>
          {profileLoading || !profile ? (
            <>
              <div className="gh-skeleton" style={{ width: '100%', maxWidth: 296, aspectRatio: '1', borderRadius: '50%' }} />
              <div className="gh-skeleton" style={{ height: 28, width: '70%', marginTop: 16 }} />
              <div className="gh-skeleton" style={{ height: 22, width: '40%', marginTop: 8 }} />
            </>
          ) : (
            <>
              <img
                className="gh-avatar"
                src={profile.avatarUrl}
                alt={profile.login}
                width={296}
                height={296}
              />
              <h1 className="gh-profile-name">{displayName}</h1>
              <p className="gh-profile-login">{profile.login}</p>
              {profile.bio ? <p className="gh-bio">{profile.bio}</p> : null}

              <a
                className="gh-btn"
                href={profile.htmlUrl}
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>

              <div className="gh-counts">
                <span><strong>{profile.followers}</strong> followers</span>
                <span>·</span>
                <span><strong>{profile.following}</strong> following</span>
                <span>·</span>
                <span><strong>{profile.publicRepos}</strong> repos</span>
              </div>

              <div className="gh-meta">
                {profile.company ? <span>{profile.company}</span> : null}
                {profile.location ? <span>{profile.location}</span> : null}
                {blogHref ? (
                  <a href={blogHref} target="_blank" rel="noreferrer">{profile.blog}</a>
                ) : null}
              </div>
            </>
          )}
        </aside>

        <section>
          <h2 className="gh-section-title">
            Popular repositories
          </h2>

          {reposLoading ? (
            <ul className="gh-repo-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="gh-repo-card">
                  <div className="gh-skeleton" style={{ height: 16, width: '50%' }} />
                  <div className="gh-skeleton" style={{ height: 40, width: '100%', marginTop: 8 }} />
                </li>
              ))}
            </ul>
          ) : projects.length === 0 ? (
            <p className="gh-muted">No public repositories yet.</p>
          ) : (
            <ul className="gh-repo-grid">
              {projects.map((p) => (
                <li key={p.id} className="gh-repo-card">
                  <a className="gh-repo-name" href={p.url} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                  <p className="gh-repo-desc">
                    {p.description || 'No description'}
                  </p>
                  <div className="gh-repo-footer">
                    {p.language ? (
                      <span>
                        <span
                          className="gh-lang-dot"
                          style={{ background: LANG_COLORS[p.language] ?? '#8b949e' }}
                        />
                        {p.language}
                      </span>
                    ) : null}
                    {p.stars > 0 ? <span>★ {p.stars}</span> : null}
                    {p.forks > 0 ? <span>Forks {p.forks}</span> : null}
                    <span>Updated {formatDate(p.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
