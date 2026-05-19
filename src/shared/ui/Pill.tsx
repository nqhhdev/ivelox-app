import { type ReactNode, type CSSProperties } from 'react'

interface PillProps {
  children: ReactNode
  color?: string
  bg?: string
  size?: 'sm' | 'md'
  style?: CSSProperties
}

export function Pill({ children, color = '#aa3bff', bg = '#faf5ff', size = 'md', style }: PillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: size === 'sm' ? '3px 8px' : '5px 12px',
      borderRadius: 999,
      background: bg,
      color,
      fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      ...style,
    }}>
      {children}
    </span>
  )
}
