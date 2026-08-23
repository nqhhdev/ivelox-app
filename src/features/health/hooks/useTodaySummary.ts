import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/healthApi'

export function useTodaySummary(date: string) {
  return useQuery({
    queryKey: ['health', 'today', date],
    queryFn: () => healthApi.today(date),
  })
}
