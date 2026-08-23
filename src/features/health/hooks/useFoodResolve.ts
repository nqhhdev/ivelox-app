import { useMutation } from '@tanstack/react-query'
import { healthApi } from '../api/healthApi'

export function useFoodResolve() {
  return useMutation({ mutationFn: healthApi.resolveFood })
}
