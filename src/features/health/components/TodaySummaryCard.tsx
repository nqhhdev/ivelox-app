import { tokens } from '@/shared/ui/tokens'
import type { DayMealSummary } from '../types'

export interface TodaySummaryCardProps {
  summary: DayMealSummary
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function TodaySummaryCard({ summary }: TodaySummaryCardProps) {
  const macros = [
    { label: 'Protein', value: `${fmt(summary.protein_g)}g`, color: '#22c55e' },
    { label: 'Carbs', value: `${fmt(summary.carb_g)}g`, color: '#fbbf24' },
    { label: 'Fat', value: `${fmt(summary.fat_g)}g`, color: '#f97316' },
    { label: 'Meals', value: String(summary.meal_count), color: '#aa3bff' },
  ]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 16,
      padding: '22px 24px',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
        Today
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.1, fontFamily: tokens.mono, color: '#fbbf24' }}>
          {fmt(summary.eaten_kcal)}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>kcal eaten</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {macros.map((m) => (
          <div key={m.label}>
            <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: tokens.mono }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
