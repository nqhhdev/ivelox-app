import { useQuery } from '@tanstack/react-query'
import { portfolioContent, type GithubProfile, type PortfolioProject } from '../content'

type GithubUserResponse = {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  location: string | null
  blog: string | null
  company: string | null
  public_repos: number
  followers: number
  following: number
}

type GithubRepoResponse = {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
  archived: boolean
  updated_at: string
}

async function fetchGithubProfile(user: string): Promise<GithubProfile> {
  const res = await fetch(`https://api.github.com/users/${user}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error('github profile fetch failed')
  const u = (await res.json()) as GithubUserResponse
  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    avatarUrl: u.avatar_url,
    htmlUrl: u.html_url,
    location: u.location,
    publicRepos: u.public_repos,
    followers: u.followers,
    following: u.following,
  }
}

async function fetchGithubRepos(user: string): Promise<PortfolioProject[]> {
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?sort=updated&per_page=30&type=owner`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )
  if (!res.ok) throw new Error('github repos fetch failed')
  const repos = (await res.json()) as GithubRepoResponse[]
  return repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      id: `gh-${r.id}`,
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
    }))
}

export function useGithubProfile() {
  return useQuery({
    queryKey: ['portfolio', 'profile', portfolioContent.githubUser],
    queryFn: () => fetchGithubProfile(portfolioContent.githubUser),
    staleTime: 1000 * 60 * 30,
  })
}

export function usePortfolioProjects() {
  return useQuery({
    queryKey: ['portfolio', 'repos', portfolioContent.githubUser],
    queryFn: () => fetchGithubRepos(portfolioContent.githubUser),
    staleTime: 1000 * 60 * 30,
  })
}
