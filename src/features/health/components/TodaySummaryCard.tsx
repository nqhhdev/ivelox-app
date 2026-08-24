import type { DayMealSummary } from '../types'

export interface TodaySummaryCardProps {
  summary: DayMealSummary
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function MacroBar({
  label,
  eaten,
  target,
}: {
  label: string
  eaten: number
  target?: number | null
}) {
  const pct = target && target > 0 ? Math.min(100, (eaten / target) * 100) : 0
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        <span>{label}</span>
        <span className="grg-hint" style={{ margin: 0 }}>
          {fmt(eaten)}
          {target != null ? ` / ${target}g` : 'g'}
        </span>
      </div>
      <div className="grg-macro-track">
        <div className="grg-macro-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const burned = summary.burned_kcal ?? 0
  const net = summary.net_kcal ?? summary.eaten_kcal - burned
  const remaining = summary.remaining_kcal
  const target = summary.daily_kcal_target

  return (
    <div className="grg-panel">
      <p className="grg-eyebrow">Today</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <span className="grg-kcal">{fmt(summary.eaten_kcal)}</span>
        <span className="grg-hint" style={{ margin: 0 }}>
          kcal eaten
          {target != null ? ` / ${target}` : ''}
        </span>
      </div>
      {summary.tip && (
        <p className="grg-lead" style={{ marginBottom: '1rem' }}>
          {summary.tip}
        </p>
      )}
      <div className="grg-stat-grid" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="grg-stat-value">{fmt(burned)}</div>
          <div className="grg-stat-label">Burned</div>
        </div>
        <div>
          <div className="grg-stat-value">{fmt(net)}</div>
          <div className="grg-stat-label">Net</div>
        </div>
        <div>
          <div className="grg-stat-value">{remaining == null ? '—' : fmt(remaining)}</div>
          <div className="grg-stat-label">Left</div>
        </div>
        <div>
          <div className="grg-stat-value">{summary.meal_count}</div>
          <div className="grg-stat-label">Meals</div>
        </div>
      </div>
      <MacroBar label="Protein" eaten={summary.protein_g} target={summary.protein_g_target} />
      <MacroBar label="Carbs" eaten={summary.carb_g} target={summary.carb_g_target} />
      <MacroBar label="Fat" eaten={summary.fat_g} target={summary.fat_g_target} />
    </div>
  )
}
