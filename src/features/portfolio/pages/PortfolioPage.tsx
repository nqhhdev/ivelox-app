import { Link } from 'react-router-dom'
import { portfolioContent } from '@/features/portfolio/content'
import {
  useGithubProfile,
  usePortfolioProjects,
} from '@/features/portfolio/hooks/usePortfolioProjects'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { usePlatformFeatures } from '@/shared/hooks/usePlatformFeatures'
import '../portfolio.css'

export function PortfolioPage() {
  const { data: profile, isLoading: profileLoading } = useGithubProfile()
  const { data: projects = [], isLoading: reposLoading } = usePortfolioProjects()
  const { data: features } = usePlatformFeatures()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)
  const healthEnabled = features?.health.enabled !== false

  const avatarUrl = profile?.avatarUrl
  const githubUrl = profile?.htmlUrl ?? `https://github.com/${portfolioContent.githubUser}`
  const mailto = `mailto:${portfolioContent.email}?subject=${encodeURIComponent('Project inquiry — Flutter / mobile')}`

  return (
    <div className="grg-page">
      <header className="grg-top">
        <Link to="/" className="grg-brand">{portfolioContent.brand}</Link>
        <nav>
          <a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a>
          <a href={mailto}>Contact</a>
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

      <main className="grg-matrioska">
        <div className="grg-hero-media" aria-hidden={profileLoading}>
          {profileLoading || !avatarUrl ? (
            <div className="grg-skeleton" style={{ width: '100%', aspectRatio: 1 }} />
          ) : (
            <>
              <div className="grg-avatar-frame" />
              <img
                className="grg-avatar"
                src={avatarUrl}
                alt=""
                width={280}
                height={280}
              />
            </>
          )}
        </div>

        <h1>{portfolioContent.name}</h1>
        <p className="grg-subtitle">{portfolioContent.title}</p>
        <p className="grg-meta-line">
          {portfolioContent.location}
          {' · '}
          <a href={mailto}>{portfolioContent.email}</a>
          {' · '}
          <a href={githubUrl} target="_blank" rel="noreferrer">@{portfolioContent.githubUser}</a>
        </p>

        <p><em>{portfolioContent.tagline}</em></p>
        {portfolioContent.pitch.map((para) => (
          <p key={para.slice(0, 32)}>{para}</p>
        ))}

        <div className="grg-cta-row">
          <a className="grg-cta" href={mailto}>Hire / inquire</a>
          <a className="grg-cta grg-cta-ghost" href={githubUrl} target="_blank" rel="noreferrer">
            GitHub profile
          </a>
        </div>

        <ul className="grg-tags" aria-label="Skills tags">
          {portfolioContent.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <hr className="grg-hr" />

        <section className="grg-section">
          <h2>Features</h2>
          <div className="grg-skill-grid">
            {portfolioContent.skills.map((block) => (
              <div key={block.heading} className="grg-skill-card">
                <h3>{block.heading}</h3>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="grg-section">
          <h2>Campaign log</h2>
          <p style={{ color: 'rgba(238,240,242,0.62)', marginBottom: '1rem' }}>
            Selected production work — full delivery from architecture to multi-store release.
          </p>
          {portfolioContent.experience.map((job) => (
            <article key={`${job.company}-${job.period}`} className="grg-job">
              <div className="grg-job-head">
                <div className="grg-job-role">{job.role}</div>
                <div className="grg-job-period">{job.period}</div>
              </div>
              <div className="grg-job-company">{job.company}</div>
              <p>{job.summary}</p>
              <ul>
                {job.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grg-section">
          <h2>Open source</h2>
          <ul className="grg-oss-list">
            {portfolioContent.openSource.map((oss) => (
              <li key={oss.name}>
                <a className="grg-oss-name" href={oss.url} target="_blank" rel="noreferrer">
                  {oss.name}
                </a>
                <span className="grg-oss-blurb">{oss.blurb}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="grg-section">
          <h2>Public repositories</h2>
          <p style={{ color: 'rgba(238,240,242,0.62)' }}>
            Live from GitHub @{portfolioContent.githubUser}
            {profile ? ` · ${profile.publicRepos} public repos · ${profile.followers} followers` : ''}.
          </p>
          {reposLoading ? (
            <div className="grg-repo-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grg-skeleton" style={{ height: 120 }} />
              ))}
            </div>
          ) : (
            <ul className="grg-repo-grid">
              {projects.slice(0, 8).map((p) => (
                <li key={p.id} className="grg-repo-card">
                  <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                  <p className="grg-repo-desc">{p.description || 'No description'}</p>
                  <div className="grg-repo-meta">
                    {[p.language, p.stars > 0 ? `★ ${p.stars}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grg-section">
          <h2>Languages</h2>
          <ul style={{ color: 'rgba(238,240,242,0.62)', paddingLeft: '1.15rem' }}>
            {portfolioContent.languages.map((l) => (
              <li key={l.name}>
                <strong style={{ color: 'rgb(238,240,242)', fontWeight: 400 }}>{l.name}</strong>
                {' — '}
                {l.level}
              </li>
            ))}
          </ul>
        </section>

        <hr className="grg-hr" />

        <p>{portfolioContent.signOff}</p>
        <p className="grg-signed">
          — {portfolioContent.name}
          <br />
          <a href={mailto}>{portfolioContent.email}</a>
        </p>
      </main>
    </div>
  )
}
