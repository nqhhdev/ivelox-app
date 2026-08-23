import type { CSSProperties } from 'react'
import { tokens } from '@/shared/ui/tokens'
import type { FoodItem, FoodUnit, ResolveResult } from '../types'

export interface ResolvePreviewProps {
  items: FoodItem[]
  source: ResolveResult['source']
  notes?: string
  quantity: number
  unit: FoodUnit
  confirming?: boolean
  onQuantityChange: (value: number) => void
  onConfirm: () => void
  onBack: () => void
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontFamily: tokens.font,
  fontSize: 14,
  outline: 'none',
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export function ResolvePreview({
  items,
  source,
  notes,
  quantity,
  unit,
  confirming,
  onQuantityChange,
  onConfirm,
  onBack,
}: ResolvePreviewProps) {
  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein_g: acc.protein_g + item.protein_g,
      carb_g: acc.carb_g + item.carb_g,
      fat_g: acc.fat_g + item.fat_g,
    }),
    { kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Preview</h2>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 999,
          background: source === 'cache' ? 'rgba(34,197,94,0.18)' : 'rgba(170,59,255,0.22)',
          color: source === 'cache' ? '#86efac' : '#e9d5ff',
          fontFamily: tokens.mono,
        }}>
          {source}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 14,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', fontFamily: tokens.mono }}>
                {fmt(item.kcal)} kcal
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: tokens.mono }}>
              {fmt(item.quantity)} {item.unit}
              {' · '}P {fmt(item.protein_g)}g
              {' · '}C {fmt(item.carb_g)}g
              {' · '}F {fmt(item.fat_g)}g
            </div>
          </div>
        ))}
      </div>

      {notes && (
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45 }}>{notes}</p>
      )}

      <div>
        <label
          htmlFor="health-preview-qty"
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 6,
          }}
        >
          Quantity ({unit})
        </label>
        <input
          id="health-preview-qty"
          type="number"
          min="0.01"
          step="any"
          value={quantity}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isFinite(n) && n > 0) onQuantityChange(n)
          }}
          style={inputStyle}
        />
        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Totals scale with quantity · {fmt(totals.kcal)} kcal
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={confirming}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: tokens.font,
            fontSize: 14,
            fontWeight: 600,
            cursor: confirming ? 'default' : 'pointer',
          }}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          style={{
            flex: 2,
            padding: '12px 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
            color: '#fff',
            border: 'none',
            fontFamily: tokens.font,
            fontSize: 14,
            fontWeight: 700,
            cursor: confirming ? 'default' : 'pointer',
            boxShadow: '0 12px 32px rgba(170,59,255,0.40)',
            opacity: confirming ? 0.7 : 1,
          }}
        >
          {confirming ? 'Saving…' : 'Confirm meal'}
        </button>
      </div>
    </div>
  )
}
