import type { FoodUnit } from '../types'

const UNITS: FoodUnit[] = ['g', 'ml', 'serving', 'piece']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export interface MealLogFormProps {
  text: string
  quantity: string
  unit: FoodUnit
  mealType?: (typeof MEAL_TYPES)[number]
  imageName?: string
  error?: string
  submitting?: boolean
  onTextChange: (value: string) => void
  onQuantityChange: (value: string) => void
  onUnitChange: (value: FoodUnit) => void
  onMealTypeChange: (value: (typeof MEAL_TYPES)[number] | undefined) => void
  onImageChange: (file: File | null) => void
  onSubmit: () => void
}

export function MealLogForm({
  text,
  quantity,
  unit,
  mealType,
  imageName,
  error,
  submitting,
  onTextChange,
  onQuantityChange,
  onUnitChange,
  onMealTypeChange,
  onImageChange,
  onSubmit,
}: MealLogFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="grg-stack"
    >
      <div>
        <label htmlFor="health-food-text" className="grg-label">
          Food
        </label>
        <input
          id="health-food-text"
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="e.g. pho bo, 2 eggs…"
          maxLength={500}
          className={`grg-input${error ? ' grg-input--error' : ''}`}
        />
        {error && <p className="grg-error">{error}</p>}
      </div>

      <div className="grg-grid-2">
        <div>
          <label htmlFor="health-qty" className="grg-label">
            Quantity
          </label>
          <input
            id="health-qty"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={quantity}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || /^\d*\.?\d*$/.test(v)) {
                onQuantityChange(v)
              }
            }}
            className="grg-input"
          />
        </div>
        <div>
          <label htmlFor="health-unit" className="grg-label">
            Unit
          </label>
          <select
            id="health-unit"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as FoodUnit)}
            className="grg-select"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="health-meal-type" className="grg-label">
          Meal type
        </label>
        <select
          id="health-meal-type"
          value={mealType ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onMealTypeChange(v === '' ? undefined : (v as (typeof MEAL_TYPES)[number]))
          }}
          className="grg-select"
        >
          <option value="">Optional</option>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="grg-label">Photo</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label htmlFor="health-photo" className="grg-file-btn">
            {imageName ? 'Change photo' : 'Add photo'}
          </label>
          <input
            id="health-photo"
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          {imageName && (
            <>
              <span className="grg-hint" style={{ margin: 0, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {imageName}
              </span>
              <button type="button" className="grg-btn grg-btn--quiet" onClick={() => onImageChange(null)}>
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      <button type="submit" className="grg-btn grg-btn--block" disabled={submitting}>
        {submitting ? 'Resolving…' : 'Resolve'}
      </button>
    </form>
  )
}
