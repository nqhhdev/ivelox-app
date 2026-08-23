import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { healthApi } from '../api/healthApi'

export function useMeals(date: string) {
  const qc = useQueryClient()
  const list = useQuery({
    queryKey: ['health', 'meals', date],
    queryFn: () => healthApi.listMeals(date),
  })
  const create = useMutation({
    mutationFn: healthApi.createMeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['health', 'meals', date] })
      void qc.invalidateQueries({ queryKey: ['health', 'today', date] })
    },
  })
  const remove = useMutation({
    mutationFn: healthApi.deleteMeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['health', 'meals', date] })
      void qc.invalidateQueries({ queryKey: ['health', 'today', date] })
    },
  })
  return { list, create, remove }
}
