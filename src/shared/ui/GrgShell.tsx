import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface GrgShellProps {
  brand?: string
  brandTo?: string
  nav?: ReactNode
  children: ReactNode
  narrow?: boolean
  narrowSm?: boolean
  /** Light board theme (health) */
  light?: boolean
}

export function GrgShell({
  brand = 'iVelox',
  brandTo = '/',
  nav,
  children,
  narrow = false,
  narrowSm = false,
  light = false,
}: GrgShellProps) {
  return (
    <div className={`grg-page${light ? ' grg-page--light' : ''}`}>
      <header className="grg-top">
        <Link to={brandTo} className="grg-brand">
          {brand}
        </Link>
        {nav ? <nav>{nav}</nav> : null}
      </header>
      {narrow || narrowSm ? (
        <main className={`grg-narrow${narrowSm ? ' grg-narrow-sm' : ''}`}>{children}</main>
      ) : (
        children
      )}
    </div>
  )
}
