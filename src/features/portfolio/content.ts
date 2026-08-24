export const portfolioContent = {
  brand: 'iVelox',
  githubUser: 'nqhhdev',
} as const

export type GithubProfile = {
  login: string
  name: string | null
  bio: string | null
  avatarUrl: string
  htmlUrl: string
  location: string | null
  blog: string | null
  company: string | null
  publicRepos: number
  followers: number
  following: number
}

export type PortfolioProject = {
  id: string
  name: string
  description: string
  url: string
  language: string | null
  stars: number
  forks: number
  updatedAt: string
}
