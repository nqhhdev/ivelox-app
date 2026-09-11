import type { MealPlanSlot } from '../types'

export function MealPlanList({
  slots,
  onStatus,
}: {
  slots: MealPlanSlot[]
  onStatus?: (mealType: string, status: 'done' | 'skipped' | 'planned') => void
}) {
  if (!slots.length) {
    return (
      <div className="grg-empty">
        No meal targets yet. Open Goals and pick which meals you eat.
      </div>
    )
  }

  return (
    <div className="grg-meal-list">
      {slots.map((s) => {
        const eaten = s.eaten_kcal ?? 0
        const closed = s.status === 'closed' || s.status === 'done' || s.status === 'skipped'
        return (
          <div key={s.meal_type} className="grg-meal-row">
            <div className="grg-meal-row__body">
              <div className="grg-meal-row__title" style={{ textTransform: 'capitalize' }}>
                {s.meal_type}
                {s.status ? (
                  <span className="grg-badge" style={{ marginLeft: 8 }}>
                    {s.status}
                  </span>
                ) : null}
              </div>
              <div className="grg-meal-row__meta">
                eaten {Math.round(eaten)}
                {s.base_kcal != null ? ` · base ${s.base_kcal}` : ''}
              </div>
              {onStatus && !closed ? (
                <div className="hb-chip-row">
                  <button
                    type="button"
                    className="hb-chip hb-chip--ok"
                    onClick={() => onStatus(s.meal_type, 'done')}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="hb-chip hb-chip--muted"
                    onClick={() => onStatus(s.meal_type, 'skipped')}
                  >
                    Skip
                  </button>
                </div>
              ) : null}
            </div>
            <div className="grg-meal-row__kcal">
              <strong>{s.target_kcal}</strong>
              <span>kcal</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
