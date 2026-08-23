import { apiClient } from '@/shared/api/client'
import type { DayMealSummary, FoodUnit, MealLog, ResolveResult } from '../types'

export const healthApi = {
  resolveFood: (body: {
    text?: string
    quantity?: number
    unit?: FoodUnit
    image_base64?: string
    image_mime?: string
  }) => apiClient.post<ResolveResult>('/api/v1/health/foods/resolve', body),

  createMeal: (body: Record<string, unknown>) =>
    apiClient.post<MealLog>('/api/v1/health/meals', body),

  listMeals: (date: string) =>
    apiClient.get<MealLog[]>(`/api/v1/health/meals?date=${date}`),

  deleteMeal: (id: string) =>
    apiClient.delete<void>(`/api/v1/health/meals/${id}`),

  today: (date: string) =>
    apiClient.get<DayMealSummary>(`/api/v1/health/check/today?date=${date}`),
}
