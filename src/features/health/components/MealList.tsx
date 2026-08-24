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
    return <div className="grg-empty">No meals logged yet today.</div>
  }

  return (
    <div className="grg-meal-list">
      {meals.map((meal) => (
        <div key={meal.id} className="grg-meal-row">
          <div className="grg-meal-row__body">
            <div className="grg-meal-row__title">{meal.raw_input || 'Meal'}</div>
            <div className="grg-meal-row__meta">
              {fmt(meal.quantity)} {meal.unit}
              {meal.meal_type ? ` · ${meal.meal_type}` : ''}
              {meal.logged_at ? ` · ${timeLabel(meal.logged_at)}` : ''}
            </div>
          </div>
          <div className="grg-meal-row__kcal">
            <strong>{fmt(meal.kcal)}</strong>
            <span>kcal</span>
          </div>
          <button
            type="button"
            className="grg-btn grg-btn--danger"
            disabled={deletingId === meal.id}
            onClick={() => onDelete(meal.id)}
            style={{ padding: '0.4rem 0.7rem', flexShrink: 0 }}
          >
            {deletingId === meal.id ? '…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  )
}
