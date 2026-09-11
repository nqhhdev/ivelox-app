import { Link, Navigate, useParams } from 'react-router-dom'
import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import { getBlogPost, getCaseStudy } from '@/features/portfolio/content'
import '../portfolio.css'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined
  if (!post) return <Navigate to="/blog" replace />
  const related = getCaseStudy(post.related)

  return (
    <PortfolioShell article>
      <p className="grg-eyebrow">
        {post.status === 'queued' ? 'Queued outline' : post.date} · {post.related}
      </p>
      <h1 className="grg-article-title">{post.title}</h1>
      <p className="grg-subtitle">{post.abstract}</p>

      <section className="grg-section">
        <h2>Status</h2>
        <p>
          This is a public outline, not a finished essay. The full post ships when it can cite a real
          failure path from Twake, Tmail, or Vault22 — not when a model can pad 800 words.
        </p>
      </section>

      {related && (
        <section className="grg-section">
          <h2>Related case study</h2>
          <p>
            <Link to={`/work/${related.slug}`}>{related.title}</Link>
            {' — '}
            {related.lede}
          </p>
        </section>
      )}

      <p>
        <Link to="/blog">← Blog backlog</Link>
      </p>
    </PortfolioShell>
  )
}
