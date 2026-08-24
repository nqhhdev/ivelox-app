import { apiClient } from '@/shared/api/client'
import type {
  BodyMetric,
  BurnLog,
  DayMealSummary,
  FoodUnit,
  HealthGoal,
  MealLog,
  MealPlanSlot,
  ResolveResult,
  WeeklyCheck,
} from '../types'

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
  image_base64?: string
  image_mime?: string
}

export type UpsertGoalBody = {
  height_cm?: number
  weight_kg?: number
  sex?: string
  age_years?: number
  activity_level?: string
  weight_change_pct?: number
  weeks?: number
  daily_burn_target?: number
  meal_types?: string[]
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

  weekly: (days = 7) =>
    apiClient.get<WeeklyCheck>(`/api/v1/health/check/weekly?days=${days}`),

  createBody: (body: { height_cm: number; weight_kg: number }) =>
    apiClient.post<BodyMetric>('/api/v1/health/body-metrics', body),

  latestBody: () => apiClient.get<BodyMetric>('/api/v1/health/body-metrics/latest'),

  upsertGoal: (body: UpsertGoalBody) =>
    apiClient.put<HealthGoal>('/api/v1/health/goals', body),

  getGoal: () => apiClient.get<HealthGoal>('/api/v1/health/goals'),

  mealPlan: () => apiClient.get<MealPlanSlot[]>('/api/v1/health/goals/meal-plan'),

  bodyAtlas: () =>
    apiClient.get<{
      disclaimer: string
      citations: { id: string; title: string; url: string }[]
      layers: { id: string; label: string; color: string }[]
      regions: {
        id: string
        label: string
        position: number[]
        tips: { layer: string; text: string; citation_ids: string[] }[]
      }[]
      future_conditions: {
        id: string
        label: string
        systems: string[]
        status: string
        note: string
      }[]
    }>('/api/v1/health/body/atlas'),

  createBurn: (body: { activity_name: string; duration_min: number; kcal_burned?: number }) =>
    apiClient.post<BurnLog>('/api/v1/health/burns', body),

  listBurns: (date: string) =>
    apiClient.get<BurnLog[]>(`/api/v1/health/burns?date=${encodeURIComponent(date)}`),

  deleteBurn: (id: string) =>
    apiClient.delete<void>(`/api/v1/health/burns/${encodeURIComponent(id)}`),

  setMealSlot: (body: { date?: string; meal_type: string; status: string }) =>
    apiClient.put<void>('/api/v1/health/meal-slots', body),

  dailyWeight: (body: { date?: string; weight_kg: number }) =>
    apiClient.post<{
      date: string
      weight_kg: number
      bmi: number | null
      bmi_category: string | null
    }>('/api/v1/health/weights/daily', body),

  closeDay: (date?: string) =>
    apiClient.post<{
      date: string
      eaten_kcal: number
      burned_kcal: number
      net_kcal: number
      protein_g: number
      carb_g: number
      fat_g: number
      kcal_target: number | null
      protein_g_target: number | null
      carb_g_target: number | null
      fat_g_target: number | null
      tips: string[]
    }>(`/api/v1/health/check/close-day${date ? `?date=${encodeURIComponent(date)}` : ''}`),
}
