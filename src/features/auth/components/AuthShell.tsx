import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  children: ReactNode
  /** @deprecated GRG theme is always dark */
  tone?: 'light' | 'dark'
  centered?: boolean
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grg-page" style={{ display: 'flex', flexDirection: 'column' }}>
      <header className="grg-top">
        <Link to="/" className="grg-brand">
          iVelox
        </Link>
        <nav>
          <Link to="/">← Portfolio</Link>
        </nav>
      </header>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
