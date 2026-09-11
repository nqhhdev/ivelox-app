import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import { ossHighlights, portfolioContent } from '@/features/portfolio/content'
import { useGithubProfile, usePortfolioProjects } from '@/features/portfolio/hooks/usePortfolioProjects'
import '../portfolio.css'

export function OssPage() {
  const { data: profile } = useGithubProfile()
  const { data: projects = [], isLoading: reposLoading } = usePortfolioProjects()

  return (
    <PortfolioShell>
      <p className="grg-eyebrow">Open source</p>
      <h1 className="grg-article-title">PRs, not org names</h1>
      <p className="grg-subtitle">
        Merged work in production-used Flutter clients. A reviewed PR in Twake Mail or Twake Chat is the
        proof — not a contribution-graph screenshot.
      </p>

      {ossHighlights.map((oss) => (
        <section key={oss.repo} className="grg-section">
          <h2>
            <a href={oss.url} target="_blank" rel="noreferrer">
              {oss.repo}
            </a>
          </h2>
          <p>{oss.blurb}</p>
          {oss.prs.length > 0 && (
            <ul className="grg-prose-list">
              {oss.prs.map((pr) => (
                <li key={pr.url}>
                  <a href={pr.url} target="_blank" rel="noreferrer">
                    {pr.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="grg-section">
        <h2>Public repositories</h2>
        <p className="grg-section-lede">
          Live from GitHub @{portfolioContent.githubUser}
          {profile ? ` · ${profile.publicRepos} public repos · ${profile.followers} followers` : ''}.
          Personal repos are secondary to the Linagora work above.
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
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.name}
                </a>
                <p className="grg-repo-desc">{p.description || 'No description'}</p>
                <div className="grg-repo-meta">
                  {[p.language, p.stars > 0 ? `★ ${p.stars}` : null].filter(Boolean).join(' · ')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PortfolioShell>
  )
}
