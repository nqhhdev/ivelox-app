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

export interface MealPlanSlot {
  meal_type: string
  target_kcal: number
  pct: number
  suggestion: string
  notes: string
}

/** Enriched /check/today (P4) — keeps eaten macros for P1 card. */
export interface DayMealSummary {
  eaten_kcal: number
  burned_kcal?: number
  net_kcal?: number
  remaining_kcal?: number | null
  daily_kcal_target?: number | null
  protein_g: number
  carb_g: number
  fat_g: number
  meal_count: number
  bmi?: number | null
  bmi_category?: string | null
  target_weight_kg?: number | null
  tip?: string | null
  meal_plan?: MealPlanSlot[]
}

export interface BodyMetric {
  id: string
  height_cm: number
  weight_kg: number
  bmi: number
  bmi_category: string
  recorded_at: string
}

export interface BurnLog {
  id: string
  activity_name: string
  duration_min: number
  kcal_burned: number
  source: string
  logged_at: string
}

export interface HealthGoal {
  height_cm: number | null
  weight_kg: number | null
  bmi: number | null
  bmi_category: string | null
  sex: string | null
  age_years: number | null
  activity_level: string | null
  weight_change_pct: number | null
  weeks: number | null
  target_weight_kg: number | null
  kg_to_change: number | null
  daily_kcal_target: number | null
  daily_burn_target: number | null
  start_at: string | null
  target_at: string | null
  meal_plan: MealPlanSlot[]
}

export interface WeeklyCheck {
  days: number
  eaten_kcal: number
  burned_kcal: number
  net_kcal: number
  avg_eaten_kcal: number
  daily_kcal_target: number | null
  score: number
  tips: string[]
}
