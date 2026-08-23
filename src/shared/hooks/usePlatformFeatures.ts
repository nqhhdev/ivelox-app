import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

export type FeaturesResponse = {
  health: {
    enabled: boolean
    auth_required: boolean
  }
}

export function usePlatformFeatures() {
  return useQuery({
    queryKey: ['platform', 'features'],
    queryFn: () => apiClient.get<FeaturesResponse>('/api/v1/features'),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
