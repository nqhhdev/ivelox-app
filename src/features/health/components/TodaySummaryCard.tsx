import type { DayMealSummary } from '../types'

export interface TodaySummaryCardProps {
  summary: DayMealSummary
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const macros = [
    { label: 'Protein', value: `${fmt(summary.protein_g)}g` },
    { label: 'Carbs', value: `${fmt(summary.carb_g)}g` },
    { label: 'Fat', value: `${fmt(summary.fat_g)}g` },
    { label: 'Meals', value: String(summary.meal_count) },
  ]

  return (
    <div className="grg-panel">
      <p className="grg-eyebrow">Today</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
        <span className="grg-kcal">{fmt(summary.eaten_kcal)}</span>
        <span className="grg-hint" style={{ margin: 0 }}>
          kcal eaten
        </span>
      </div>
      <div className="grg-stat-grid">
        {macros.map((m) => (
          <div key={m.label}>
            <div className="grg-stat-value">{m.value}</div>
            <div className="grg-stat-label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
