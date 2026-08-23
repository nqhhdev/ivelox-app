export type FoodUnit = 'g' | 'ml' | 'serving' | 'piece'

export interface FoodItem {
  name: string
  quantity: number
  unit: FoodUnit
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  confidence: number
}

export interface ResolveResult {
  items: FoodItem[]
  source: 'cache' | 'ai'
  notes?: string
}

export interface MealLog {
  id: string
  raw_input: string
  quantity: number
  unit: FoodUnit
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  meal_type?: string | null
  logged_at: string
}

export interface DayMealSummary {
  eaten_kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  meal_count: number
}
