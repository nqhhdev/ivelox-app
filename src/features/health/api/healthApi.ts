import { apiClient } from '@/shared/api/client'
import type { DayMealSummary, FoodUnit, MealLog, ResolveResult } from '../types'

export type ResolveFoodBody = {
  text?: string
  quantity?: number
  unit?: FoodUnit
  image_base64?: string
  image_mime?: string
}

export type CreateMealBody = {
  raw_input: string
  quantity: number
  unit: FoodUnit
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  meal_type?: string
}

export const healthApi = {
  resolveFood: (body: ResolveFoodBody) =>
    apiClient.post<ResolveResult>('/api/v1/health/foods/resolve', body),

  createMeal: (body: CreateMealBody) =>
    apiClient.post<MealLog>('/api/v1/health/meals', body),

  listMeals: (date: string) =>
    apiClient.get<MealLog[]>(`/api/v1/health/meals?date=${encodeURIComponent(date)}`),

  deleteMeal: (id: string) =>
    apiClient.delete<void>(`/api/v1/health/meals/${encodeURIComponent(id)}`),

  today: (date: string) =>
    apiClient.get<DayMealSummary>(
      `/api/v1/health/check/today?date=${encodeURIComponent(date)}`,
    ),
}
