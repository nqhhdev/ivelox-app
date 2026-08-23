import { useQuery } from '@tanstack/react-query'
import { portfolioContent, type PortfolioProject } from '../content'

type GithubRepo = {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
}

async function fetchGithubRepos(user: string): Promise<PortfolioProject[]> {
  const res = await fetch(
    `https://api.github.com/users/${user}/repos?sort=updated&per_page=12`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )
  if (!res.ok) {
    throw new Error('github fetch failed')
  }
  const repos = (await res.json()) as GithubRepo[]
  return repos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      id: `gh-${r.id}`,
      name: r.name,
      description: r.description ?? '',
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      source: 'github' as const,
    }))
}

function mergeProjects(github: PortfolioProject[]): PortfolioProject[] {
  const manual: PortfolioProject[] = portfolioContent.featured.map((p) => ({
    ...p,
    source: 'manual' as const,
  }))
  const manualNames = new Set(manual.map((p) => p.name.toLowerCase()))
  const fromGithub = github.filter((p) => !manualNames.has(p.name.toLowerCase()))
  return [...manual, ...fromGithub]
}

export function usePortfolioProjects() {
  return useQuery({
    queryKey: ['portfolio', 'github', portfolioContent.githubUser],
    queryFn: async () => {
      try {
        const github = await fetchGithubRepos(portfolioContent.githubUser)
        return mergeProjects(github)
      } catch {
        return mergeProjects([])
      }
    },
    staleTime: 1000 * 60 * 30,
  })
}
