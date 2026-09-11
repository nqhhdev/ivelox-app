import { Link } from 'react-router-dom'
import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import { blogPosts } from '@/features/portfolio/content'
import '../portfolio.css'

export function BlogIndexPage() {
  return (
    <PortfolioShell article>
      <p className="grg-eyebrow">Writing</p>
      <h1 className="grg-article-title">From shipped work, not from a topic generator</h1>
      <p className="grg-subtitle">
        Canonical posts will live here, then cross-post to Dev.to / Hashnode. Until a draft has a real
        log, diff, or failure path, it stays queued — I will not invent a war story to look prolific.
      </p>

      <ul className="grg-blog-list">
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <p className="grg-case-kicker">
              {post.status === 'queued' ? 'Queued' : post.date} · {post.related}
            </p>
            <h2>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.abstract}</p>
          </li>
        ))}
      </ul>
    </PortfolioShell>
  )
}
