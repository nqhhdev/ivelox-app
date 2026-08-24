import { useMemo } from 'react'

export type AnatomyLayer =
  | 'skin'
  | 'muscles'
  | 'skeleton'
  | 'vessels'
  | 'organs'
  | 'visceral_fat'
  | 'nerves'

export function estimateBodyFatPct(bmi: number, ageYears: number, sex: string): number {
  const sexAdj = sex.toLowerCase() === 'female' ? 1 : 0
  const est = 1.2 * bmi + 0.23 * ageYears - 10.8 * sexAdj - 5.4
  return Math.max(5, Math.min(50, Math.round(est * 10) / 10))
}

/** Rough visceral fat score 0–100 from BMI + eBF (educational). */
export function visceralFatScore(
  bmi: number | null | undefined,
  ebf: number | null | undefined,
): number {
  if (bmi == null) return 0
  const fat = ebf ?? 1.2 * bmi - 10
  const raw = (bmi - 18) * 3.2 + (fat - 15) * 1.4
  return Math.max(0, Math.min(100, Math.round(raw)))
}

export function healthScore(opts: {
  remainingKcal: number | null | undefined
  dailyTarget: number | null | undefined
  proteinG: number
  proteinTarget: number | null | undefined
  burned: number
}): number {
  let score = 70
  if (opts.dailyTarget && opts.remainingKcal != null) {
    const ratio = 1 - Math.abs(opts.remainingKcal) / opts.dailyTarget
    score += Math.round(Math.max(-20, Math.min(20, ratio * 20)))
  }
  if (opts.proteinTarget && opts.proteinTarget > 0) {
    const pr = opts.proteinG / opts.proteinTarget
    if (pr >= 0.8 && pr <= 1.2) score += 8
    else if (pr < 0.5) score -= 8
  }
  if (opts.burned >= 200) score += 6
  return Math.max(0, Math.min(100, score))
}

export function useWebGLOk(): boolean {
  return useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }, [])
}
