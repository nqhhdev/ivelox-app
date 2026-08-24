import type { MealPlanSlot } from '../types'

export function MealPlanList({ slots }: { slots: MealPlanSlot[] }) {
  if (!slots.length) {
    return (
      <div className="grg-empty">
        No meal plan yet. Set a goal and pick which meals you eat.
      </div>
    )
  }

  return (
    <div className="grg-meal-list">
      {slots.map((s) => (
        <div key={s.meal_type} className="grg-meal-row">
          <div className="grg-meal-row__body">
            <div className="grg-meal-row__title" style={{ textTransform: 'capitalize' }}>
              {s.meal_type}
            </div>
          </div>
          <div className="grg-meal-row__kcal">
            <strong>{s.target_kcal}</strong>
            <span>kcal</span>
          </div>
        </div>
      ))}
    </div>
  )
}
