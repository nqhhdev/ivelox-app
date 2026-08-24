/** Global design tokens — aligned with giantrobotgame.com aesthetic */
export const tokens = {
  accent: '#75d18c',
  accentSoft: 'rgba(117, 209, 140, 0.12)',
  accentBorder: 'rgba(117, 209, 140, 0.45)',
  ink: '#eef0f2',
  text: 'rgba(238, 240, 242, 0.62)',
  muted: 'rgba(238, 240, 242, 0.62)',
  bg: '#03090b',
  panel: 'rgba(11, 57, 84, 0.35)',
  border: 'rgb(11, 57, 84)',
  borderStrong: 'rgba(117, 209, 140, 0.45)',
  danger: '#f08282',
  success: '#75d18c',
  warning: '#e8c56a',
  skills: {
    reading: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    listening: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    writing: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    speaking: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
  },
  font: "'Work Sans', Lato, sans-serif",
  mono: "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
} as const

export type SkillKey = keyof typeof tokens.skills
