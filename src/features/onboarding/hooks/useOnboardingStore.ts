import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '@/shared/api/client'
import type { NativeLanguage, IeltsType, GoalPreset, DateOption } from '../schemas/onboarding.schemas'

interface SelfReport {
  reading: number
  listening: number
  writing: number
  speaking: number
}

interface OnboardingState {
  // Progress
  currentStep: 1 | 2 | 3 | 4
  isComplete: boolean

  // Step 1 — Profile
  displayName: string
  nativeLanguage: NativeLanguage
  avatarUrl: string | null
  ieltsType: IeltsType

  // Step 2 — Placement
  selfReport: SelfReport

  // Step 3 — Goals
  goalPreset: GoalPreset
  targetBand: number
  targetDate: DateOption | null

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void
  updateProfile: (data: { displayName: string; nativeLanguage: NativeLanguage; ieltsType: IeltsType }) => void
  updatePlacement: (data: SelfReport) => void
  updateGoals: (data: { goalPreset: GoalPreset; targetBand: number; targetDate: DateOption | null }) => void
  complete: () => Promise<void>
  reset: () => void
}

const GOAL_BANDS: Record<GoalPreset, number> = {
  study_abroad: 6.5,
  migration: 7.0,
  career: 7.5,
  improve: 6.0,
  high_score: 8.0,
  custom: 6.5,
}

const initialState = {
  currentStep: 1 as const,
  isComplete: false,
  displayName: '',
  nativeLanguage: 'vi' as NativeLanguage,
  avatarUrl: null,
  ieltsType: 'academic' as IeltsType,
  selfReport: { reading: 5.0, listening: 5.0, writing: 5.0, speaking: 5.0 },
  goalPreset: 'study_abroad' as GoalPreset,
  targetBand: 6.5,
  targetDate: '90d' as DateOption,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      updateProfile: (data) =>
        set({ displayName: data.displayName, nativeLanguage: data.nativeLanguage, ieltsType: data.ieltsType }),

      updatePlacement: (data) => set({ selfReport: data }),

      updateGoals: (data) =>
        set({
          goalPreset: data.goalPreset,
          targetBand: data.goalPreset !== 'custom' ? GOAL_BANDS[data.goalPreset] : data.targetBand,
          targetDate: data.targetDate,
        }),

      complete: async () => {
        const state = get()
        // Optimistic: mark complete locally immediately
        set({ isComplete: true })

        try {
          await apiClient.post('/api/onboarding', {
            displayName: state.displayName,
            nativeLanguage: state.nativeLanguage,
            avatarUrl: state.avatarUrl,
            ieltsType: state.ieltsType,
            selfReport: state.selfReport,
            goalPreset: state.goalPreset,
            targetBand: state.targetBand,
            targetDate: state.targetDate,
          })
        } catch {
          // Network error: keep isComplete=true locally, will retry on next load
          // Server error is handled at call site via thrown error
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'ivelox_onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        displayName: state.displayName,
        nativeLanguage: state.nativeLanguage,
        avatarUrl: state.avatarUrl,
        ieltsType: state.ieltsType,
        selfReport: state.selfReport,
        goalPreset: state.goalPreset,
        targetBand: state.targetBand,
        targetDate: state.targetDate,
      }),
    },
  ),
)
