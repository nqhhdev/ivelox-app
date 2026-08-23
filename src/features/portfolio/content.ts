export const portfolioContent = {
  brand: 'iVelox',
  name: 'Huy Nguyen',
  githubUser: 'nqhhdev',
  headline: 'Builder of private tools — health, platforms, and learning systems.',
  summary:
    'Owner-operated workspace. Public work lives on GitHub; private apps (including Health) sit behind OTP.',
  links: [
    { label: 'GitHub', href: 'https://github.com/nqhhdev' },
    { label: 'Health', href: '/health', private: true },
  ],
  /** Manual featured projects — override or supplement GitHub fetch. */
  featured: [
    {
      id: 'ivelox-core',
      name: 'ivelox-core',
      description: 'Spring Boot private platform: OTP auth, Health nutrition APIs.',
      url: 'https://github.com/nqhhdev/ivelox-core',
      language: 'Java',
    },
    {
      id: 'ivelox-app',
      name: 'ivelox-app',
      description: 'React frontend — portfolio shell and Health meal log.',
      url: 'https://github.com/nqhhdev/ivelox-app',
      language: 'TypeScript',
    },
  ],
} as const

export type PortfolioProject = {
  id: string
  name: string
  description: string
  url: string
  language: string | null
  stars?: number
  source: 'manual' | 'github'
}
