export const tokens = {
  accent: '#aa3bff',
  accentSoft: '#faf5ff',
  accentBorder: '#e9d5ff',
  ink: '#0a0e27',
  text: '#4b5563',
  muted: '#9ca3af',
  bg: '#faf9f5',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  skills: {
    reading:   { color: '#3b82f6', soft: '#eff6ff' },
    listening: { color: '#f59e0b', soft: '#fffbeb' },
    writing:   { color: '#f43f5e', soft: '#fff1f2' },
    speaking:  { color: '#14b8a6', soft: '#f0fdfa' },
  },
  font: "'Geist Variable', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
} as const

export type SkillKey = keyof typeof tokens.skills
