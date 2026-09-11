import { PortfolioShell } from '@/features/portfolio/components/PortfolioShell'
import { nowItems } from '@/features/portfolio/content'
import '../portfolio.css'

export function NowPage() {
  return (
    <PortfolioShell article>
      <p className="grg-eyebrow">Now</p>
      <h1 className="grg-article-title">This week</h1>
      <p className="grg-subtitle">
        Updated 10 Sep 2026. A now page is a changelog, not a manifesto. If this goes stale, ignore it.
      </p>
      {nowItems.map((item) => (
        <section key={item.title} className="grg-section">
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </section>
      ))}
    </PortfolioShell>
  )
}
