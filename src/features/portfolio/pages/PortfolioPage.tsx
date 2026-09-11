import { Link } from 'react-router-dom'
import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import {
  caseStudies,
  earlierWork,
  languages,
  portfolioContent,
  signOff,
} from '@/features/portfolio/content'
import { useGithubProfile } from '@/features/portfolio/hooks/usePortfolioProjects'
import '../portfolio.css'

export function PortfolioPage() {
  const { data: profile, isLoading: profileLoading } = useGithubProfile()
  const avatarUrl = profile?.avatarUrl
  const githubUrl = profile?.htmlUrl ?? `https://github.com/${portfolioContent.githubUser}`
  const mailto = `mailto:${portfolioContent.email}?subject=${encodeURIComponent('Project inquiry — Flutter production')}`

  return (
    <PortfolioShell>
      <div className="grg-hero">
        <div className="grg-hero-copy">
          <p className="grg-eyebrow">{portfolioContent.title}</p>
          <h1>
            Nguyen Quang <span className="grg-accent">Huy</span>
          </h1>
          <p className="grg-subtitle">{portfolioContent.tagline}</p>
          <p className="grg-meta-line">
            {portfolioContent.location}
            {' · '}
            <a href={mailto}>{portfolioContent.email}</a>
            {' · '}
            <a href={githubUrl} target="_blank" rel="noreferrer">
              @{portfolioContent.githubUser}
            </a>
          </p>

          {portfolioContent.pitch.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}

          <ul className="grg-proofs" aria-label="Proof points">
            {portfolioContent.proofs.map((p) => (
              <li key={p.label}>
                <strong>{p.value}</strong>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>

          <div className="grg-cta-row">
            <a className="grg-cta" href={mailto}>
              Contact →
            </a>
            <a className="grg-cta grg-cta-ghost" href={githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link className="grg-cta grg-cta-ghost" to="/oss">
              Public PRs
            </Link>
          </div>

          <ul className="grg-tags" aria-label="Skills tags">
            {portfolioContent.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="grg-hero-media" aria-hidden={profileLoading}>
          {profileLoading || !avatarUrl ? (
            <div className="grg-skeleton" style={{ width: '100%', aspectRatio: 1, borderRadius: 26 }} />
          ) : (
            <>
              <div className="grg-avatar-frame" />
              <img className="grg-avatar" src={avatarUrl} alt="" width={380} height={380} />
            </>
          )}
        </div>
      </div>

      <section className="grg-section">
        <h2>Case studies</h2>
        <p className="grg-section-lede">
          Four production stories. AngelHub and SCM stay in the log below — they are real, they are not the
          brand.
        </p>
        <ul className="grg-case-grid">
          {caseStudies.map((cs) => (
            <li key={cs.slug} className="grg-case-card">
              <p className="grg-case-kicker">
                {cs.company} · {cs.period}
              </p>
              <h3>
                <Link to={`/work/${cs.slug}`}>{cs.title}</Link>
              </h3>
              <p>{cs.lede}</p>
              <Link className="grg-case-more" to={`/work/${cs.slug}`}>
                Read the case →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grg-section">
        <h2>Earlier work</h2>
        {earlierWork.map((job) => (
          <article key={`${job.company}-${job.period}`} className="grg-job">
            <div className="grg-job-head">
              <div className="grg-job-role">{job.role}</div>
              <div className="grg-job-period">{job.period}</div>
            </div>
            <div className="grg-job-company">{job.company}</div>
            <p>{job.summary}</p>
          </article>
        ))}
      </section>

      <section className="grg-section">
        <h2>Languages</h2>
        <ul className="grg-lang-list">
          {languages.map((l) => (
            <li key={l.name}>
              <strong>{l.name}</strong>
              {' — '}
              {l.level}
            </li>
          ))}
        </ul>
      </section>

      <hr className="grg-hr" />
      <p>{signOff}</p>
      <p className="grg-signed">
        — {portfolioContent.name}
        <br />
        <a href={mailto}>{portfolioContent.email}</a>
      </p>
    </PortfolioShell>
  )
}
