import type { MealPlanSlot } from '../types'

export function MealPlanList({ slots }: { slots: MealPlanSlot[] }) {
  if (!slots.length) {
    return (
      <div className="grg-empty">
        No meal plan yet. Set a BMI goal to generate today&apos;s kcal split.
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
            <div className="grg-meal-row__meta">{s.suggestion}</div>
            <div className="grg-hint" style={{ marginTop: 4 }}>
              {s.notes}
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
