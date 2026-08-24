import type { DayMealSummary } from '../types'

export interface TodaySummaryCardProps {
  summary: DayMealSummary
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const burned = summary.burned_kcal ?? 0
  const net = summary.net_kcal ?? summary.eaten_kcal - burned
  const remaining = summary.remaining_kcal
  const target = summary.daily_kcal_target

  const stats = [
    { label: 'Burned', value: `${fmt(burned)}` },
    { label: 'Net', value: `${fmt(net)}` },
    { label: 'Left', value: remaining == null ? '—' : fmt(remaining) },
    { label: 'Target', value: target == null ? '—' : String(target) },
    { label: 'Protein', value: `${fmt(summary.protein_g)}g` },
    { label: 'Carbs', value: `${fmt(summary.carb_g)}g` },
    { label: 'Fat', value: `${fmt(summary.fat_g)}g` },
    { label: 'Meals', value: String(summary.meal_count) },
  ]

  return (
    <div className="grg-panel">
      <p className="grg-eyebrow">Today</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <span className="grg-kcal">{fmt(summary.eaten_kcal)}</span>
        <span className="grg-hint" style={{ margin: 0 }}>
          kcal eaten
        </span>
      </div>
      {summary.tip && (
        <p className="grg-lead" style={{ marginBottom: '1rem' }}>
          {summary.tip}
        </p>
      )}
      {(summary.bmi != null || summary.target_weight_kg != null) && (
        <p className="grg-hint" style={{ marginBottom: '1rem' }}>
          {summary.bmi != null && (
            <>
              BMI {fmt(summary.bmi)}
              {summary.bmi_category ? ` (${summary.bmi_category})` : ''}
            </>
          )}
          {summary.target_weight_kg != null && (
            <> · Target weight {fmt(summary.target_weight_kg)} kg</>
          )}
        </p>
      )}
      <div className="grg-stat-grid">
        {stats.map((m) => (
          <div key={m.label}>
            <div className="grg-stat-value">{m.value}</div>
            <div className="grg-stat-label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
