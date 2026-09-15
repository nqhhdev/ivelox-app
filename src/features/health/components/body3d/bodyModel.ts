import { useMemo } from 'react'

export type BodyLayer = 'fat' | 'vessels' | 'bone'

export type AtlasRegion = {
  id: string
  label: string
  position: number[]
  tips: { layer: string; text: string; citation_ids: string[] }[]
}

export type BodyMetrics = {
  bmi?: number | null
  bmiCategory?: string | null
  bodyFatPct?: number | null
  kcalLeft?: number | null
  proteinG?: number | null
  proteinTarget?: number | null
  weightKg?: number | null
  targetWeightKg?: number | null
}

/** Deurenberg-style educational estimate (matches BE BodyMath). */
export function estimateBodyFatPct(bmi: number, ageYears: number, sex: string): number {
  const sexAdj = sex.toLowerCase() === 'female' ? 1 : 0
  const est = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexAdj - 5.4
  return Math.max(5, Math.min(50, Math.round(est * 10) / 10))
}

export function useWebGLOk(): boolean {
  return useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }, [])
}
