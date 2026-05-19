import { z } from 'zod'

export const NATIVE_LANGUAGES = ['vi', 'zh', 'ja', 'ko', 'th', 'id', 'other'] as const
export const IELTS_TYPES = ['academic', 'general'] as const
export const GOAL_PRESETS = ['study_abroad', 'migration', 'career', 'improve', 'high_score', 'custom'] as const
export const DATE_OPTIONS = ['30d', '60d', '90d', '6m', '1y', 'none'] as const

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(24, 'Display name must be at most 24 characters'),
  nativeLanguage: z.enum(NATIVE_LANGUAGES),
  ieltsType: z.enum(IELTS_TYPES),
})

export const placementSchema = z.object({
  reading: z.number().min(1).max(9),
  listening: z.number().min(1).max(9),
  writing: z.number().min(1).max(9),
  speaking: z.number().min(1).max(9),
})

export const goalsSchema = z.object({
  goalPreset: z.enum(GOAL_PRESETS),
  targetBand: z.number().min(1).max(9),
  targetDate: z.enum(DATE_OPTIONS).nullable(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type PlacementFormValues = z.infer<typeof placementSchema>
export type GoalsFormValues = z.infer<typeof goalsSchema>
export type NativeLanguage = typeof NATIVE_LANGUAGES[number]
export type IeltsType = typeof IELTS_TYPES[number]
export type GoalPreset = typeof GOAL_PRESETS[number]
export type DateOption = typeof DATE_OPTIONS[number]
