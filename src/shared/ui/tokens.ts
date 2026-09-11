/** Global design tokens — 3dviz.dev cream / forest system */
export const tokens = {
  accent: '#0b7553',
  accentSoft: '#e2f4ea',
  accentBorder: '#cfe9dc',
  ink: '#1c2a23',
  text: '#3a453f',
  muted: '#55605a',
  bg: '#fffaf2',
  panel: '#ffffff',
  border: '#e2ede6',
  borderStrong: '#d7e7dd',
  danger: '#f08282',
  success: '#0b7553',
  warning: '#e8c56a',
  skills: {
    reading: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    listening: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    writing: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
    speaking: { color: '#75d18c', soft: 'rgba(117, 209, 140, 0.12)' },
  },
  font: "'Outfit Variable', Outfit, ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace",
} as const

export type SkillKey = keyof typeof tokens.skills
