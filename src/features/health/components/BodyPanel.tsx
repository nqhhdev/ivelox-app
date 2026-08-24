import { useState } from 'react'
import type { DayMealSummary } from '../types'

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n))
}

export function BodyPanel({
  summary,
  onSaveWeight,
  saving,
}: {
  summary: DayMealSummary
  onSaveWeight: (kg: number) => void
  saving?: boolean
}) {
  const [weight, setWeight] = useState(
    summary.weight_kg_today != null ? String(summary.weight_kg_today) : '',
  )
  const bmi = summary.bmi ?? 0
  // Map BMI ~15–40 onto ring progress
  const ring = clampPct(((bmi || 22) - 15) / 25 * 100)

  return (
    <aside className="grg-board__body">
      <p className="grg-eyebrow">Body</p>
      <div className="grg-bmi-ring" style={{ ['--pct' as string]: `${ring}%` }}>
        <div className="grg-bmi-ring__inner">
          <strong>{summary.bmi ?? '—'}</strong>
          <span>{summary.bmi_category ?? 'BMI'}</span>
        </div>
      </div>

      <div className="grg-stat-grid" style={{ marginTop: '1.25rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div className="grg-stat-value">{summary.weight_kg_today ?? '—'}</div>
          <div className="grg-stat-label">Weight kg</div>
        </div>
        <div>
          <div className="grg-stat-value">{summary.target_weight_kg ?? '—'}</div>
          <div className="grg-stat-label">Target</div>
        </div>
      </div>

      <form
        className="grg-stack"
        style={{ marginTop: '1.25rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          const kg = Number(weight)
          if (kg > 0) onSaveWeight(kg)
        }}
      >
        <label className="grg-label" htmlFor="daily-wt">
          Today&apos;s weight
        </label>
        <input
          id="daily-wt"
          className="grg-input"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg"
          inputMode="decimal"
        />
        <button type="submit" className="grg-btn grg-btn--block" disabled={saving}>
          {saving ? 'Saving…' : 'Update weight'}
        </button>
      </form>
    </aside>
  )
}
