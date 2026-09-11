import { Link, Navigate, useParams } from 'react-router-dom'
import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import { getCaseStudy } from '@/features/portfolio/content'
import '../portfolio.css'

export function WorkPage() {
  const { slug } = useParams<{ slug: string }>()
  const cs = slug ? getCaseStudy(slug) : undefined
  if (!cs) return <Navigate to="/" replace />

  return (
    <PortfolioShell article>
      <p className="grg-eyebrow">
        {cs.role} · {cs.company} · {cs.period}
      </p>
      <h1 className="grg-article-title">{cs.title}</h1>
      <p className="grg-subtitle">{cs.lede}</p>

      <section className="grg-section">
        <h2>Problem</h2>
        <p>{cs.problem}</p>
      </section>

      <section className="grg-section">
        <h2>Constraints</h2>
        <ul className="grg-prose-list">
          {cs.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="grg-section">
        <h2>Approach</h2>
        <ul className="grg-prose-list">
          {cs.approach.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="grg-section">
        <h2>Hardest part</h2>
        <p>{cs.hardest}</p>
      </section>

      <section className="grg-section">
        <h2>Outcome</h2>
        <p>{cs.outcome}</p>
        <p className="grg-unmeasured">{cs.unmeasured}</p>
      </section>

      {cs.links.length > 0 && (
        <section className="grg-section">
          <h2>Public links</h2>
          <ul className="grg-prose-list">
            {cs.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p>
        <Link to="/">← All work</Link>
        {' · '}
        <Link to="/oss">OSS PRs</Link>
        {' · '}
        <Link to="/blog">Blog backlog</Link>
      </p>
    </PortfolioShell>
  )
}
