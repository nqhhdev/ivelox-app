import type { CSSProperties } from 'react'
import { tokens } from '@/shared/ui/tokens'
import type { FoodUnit } from '../types'

const UNITS: FoodUnit[] = ['g', 'ml', 'serving', 'piece']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export interface MealLogFormProps {
  text: string
  quantity: number | string
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

const inputStyle = (err?: boolean): CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: `1.5px solid ${err ? tokens.danger : 'rgba(255,255,255,0.12)'}`,
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontFamily: tokens.font,
  fontSize: 14,
  outline: 'none',
})

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'rgba(255,255,255,0.45)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 6,
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
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div>
        <label htmlFor="health-food-text" style={labelStyle}>Food</label>
        <input
          id="health-food-text"
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="e.g. pho bo, 2 eggs…"
          maxLength={500}
          style={inputStyle(!!error)}
        />
        {error && <p style={{ fontSize: 12, color: tokens.danger, margin: '6px 0 0' }}>{error}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label htmlFor="health-qty" style={labelStyle}>Quantity</label>
          <input
            id="health-qty"
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            style={inputStyle()}
          />
        </div>
        <div>
          <label htmlFor="health-unit" style={labelStyle}>Unit</label>
          <select
            id="health-unit"
            value={unit}
            onChange={(e) => onUnitChange(e.target.value as FoodUnit)}
            style={{ ...inputStyle(), cursor: 'pointer' }}
          >
            {UNITS.map((u) => (
              <option key={u} value={u} style={{ color: '#111' }}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="health-meal-type" style={labelStyle}>Meal type</label>
        <select
          id="health-meal-type"
          value={mealType ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onMealTypeChange(v === '' ? undefined : (v as (typeof MEAL_TYPES)[number]))
          }}
          style={{ ...inputStyle(), cursor: 'pointer' }}
        >
          <option value="" style={{ color: '#111' }}>Optional</option>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t} style={{ color: '#111' }}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <span style={labelStyle}>Photo</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <label
            htmlFor="health-photo"
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: tokens.font,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
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
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {imageName}
              </span>
              <button
                type="button"
                onClick={() => onImageChange(null)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: tokens.font,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '14px 18px',
          marginTop: 4,
          background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontFamily: tokens.font,
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? 'default' : 'pointer',
          boxShadow: '0 12px 32px rgba(170,59,255,0.40)',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Resolving…' : 'Resolve'}
      </button>
    </form>
  )
}
