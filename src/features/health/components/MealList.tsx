import { tokens } from '@/shared/ui/tokens'
import type { MealLog } from '../types'

export interface MealListProps {
  meals: MealLog[]
  deletingId?: string | null
  onDelete: (id: string) => void
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MealList({ meals, deletingId, onDelete }: MealListProps) {
  if (meals.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 14,
        padding: '28px 20px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
      }}>
        No meals logged yet today.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {meals.map((meal) => (
        <div
          key={meal.id}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meal.raw_input || 'Meal'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: tokens.mono, marginTop: 3 }}>
              {fmt(meal.quantity)} {meal.unit}
              {meal.meal_type ? ` · ${meal.meal_type}` : ''}
              {meal.logged_at ? ` · ${timeLabel(meal.logged_at)}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', fontFamily: tokens.mono }}>
              {fmt(meal.kcal)}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>kcal</div>
          </div>
          <button
            type="button"
            disabled={deletingId === meal.id}
            onClick={() => onDelete(meal.id)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: tokens.font,
              fontSize: 12,
              fontWeight: 600,
              cursor: deletingId === meal.id ? 'default' : 'pointer',
              flexShrink: 0,
              opacity: deletingId === meal.id ? 0.6 : 1,
            }}
          >
            {deletingId === meal.id ? '…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  )
}
