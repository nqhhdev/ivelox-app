import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { portfolioContent } from '@/features/portfolio/content'
import { usePortfolioProjects } from '@/features/portfolio/hooks/usePortfolioProjects'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { usePlatformFeatures } from '@/shared/hooks/usePlatformFeatures'
import { LogoMark } from '@/shared/ui/LogoMark'
import { tokens } from '@/shared/ui/tokens'

export function PortfolioPage() {
  const { data: projects = [], isLoading } = usePortfolioProjects()
  const { data: features } = usePlatformFeatures()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const signOut = useAuthStore((s) => s.signOut)
  const healthEnabled = features?.health.enabled !== false

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 120% 80% at 10% -10%, #1a3a4a 0%, transparent 50%), linear-gradient(165deg, #0c1218 0%, #121a22 45%, #0a1014 100%)',
        fontFamily: tokens.font,
        color: '#e8eef2',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <LogoMark />
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {healthEnabled && (
            <Link
              to={isAuthenticated ? '/health' : '/login'}
              style={{
                color: 'rgba(232,238,242,0.75)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {isAuthenticated ? 'Health' : 'Login'}
            </Link>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={signOut}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(232,238,242,0.55)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: tokens.font,
              }}
            >
              Sign out
            </button>
          )}
        </nav>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 28px 96px' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: clampBrandHint(),
            fontWeight: 800,
            letterSpacing: -1.2,
            color: '#7ec8c8',
            lineHeight: 1,
          }}
        >
          {portfolioContent.brand}
        </p>
        <h1
          style={{
            margin: '0 0 16px',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            letterSpacing: -1.4,
            lineHeight: 1.15,
            maxWidth: 640,
          }}
        >
          {portfolioContent.headline}
        </h1>
        <p
          style={{
            margin: '0 0 36px',
            fontSize: 16,
            color: 'rgba(232,238,242,0.6)',
            lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          {portfolioContent.summary}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
          <a
            href={`https://github.com/${portfolioContent.githubUser}`}
            target="_blank"
            rel="noreferrer"
            style={ctaPrimary}
          >
            GitHub
          </a>
          {healthEnabled && (
            <Link to={isAuthenticated ? '/health' : '/login'} style={ctaSecondary}>
              {isAuthenticated ? 'Open Health' : 'Owner login'}
            </Link>
          )}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(232,238,242,0.4)' }}>
          Projects
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(232,238,242,0.5)' }}>
          Featured work plus recent public repos from @{portfolioContent.githubUser}.
        </p>

        {isLoading ? (
          <p style={{ color: 'rgba(232,238,242,0.4)', fontSize: 14 }}>Loading projects…</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {projects.map((p) => (
              <li key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    padding: '18px 0',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: 'rgba(232,238,242,0.35)', fontFamily: tokens.mono }}>
                      {p.language ?? '—'}
                      {typeof p.stars === 'number' ? ` · ★${p.stars}` : ''}
                    </span>
                  </div>
                  {p.description ? (
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(232,238,242,0.5)', lineHeight: 1.45 }}>
                      {p.description}
                    </p>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function clampBrandHint() {
  return 'clamp(40px, 8vw, 72px)'
}

const ctaPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderRadius: 10,
  background: '#7ec8c8',
  color: '#0a1014',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
}

const ctaSecondary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderRadius: 10,
  background: 'transparent',
  color: 'rgba(232,238,242,0.85)',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.18)',
}
