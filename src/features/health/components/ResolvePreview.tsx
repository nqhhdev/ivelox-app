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
    <div className="grg-stack">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Preview</h2>
        <span className={`grg-badge${source === 'cache' ? '' : ' grg-badge--muted'}`}>{source}</span>
      </div>

      <div className="grg-meal-list">
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className="grg-meal-row">
            <div className="grg-meal-row__body">
              <div className="grg-meal-row__title">{item.name}</div>
              <div className="grg-meal-row__meta">
                {fmt(item.quantity)} {item.unit}
                {' · '}P {fmt(item.protein_g)}g
                {' · '}C {fmt(item.carb_g)}g
                {' · '}F {fmt(item.fat_g)}g
              </div>
            </div>
            <div className="grg-meal-row__kcal">
              <strong>{fmt(item.kcal)}</strong>
              <span>kcal</span>
            </div>
          </div>
        ))}
      </div>

      {notes && <p className="grg-lead" style={{ marginBottom: 0 }}>{notes}</p>}

      <div>
        <label htmlFor="health-preview-qty" className="grg-label">
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
          className="grg-input"
        />
        <p className="grg-hint">Totals scale with quantity · {fmt(totals.kcal)} kcal</p>
      </div>

      <div className="grg-btn-row">
        <button type="button" className="grg-btn grg-btn--quiet" onClick={onBack} disabled={confirming}>
          Back
        </button>
        <button type="button" className="grg-btn" onClick={onConfirm} disabled={confirming} style={{ flex: 2 }}>
          {confirming ? 'Saving…' : 'Confirm meal'}
        </button>
      </div>
    </div>
  )
}
