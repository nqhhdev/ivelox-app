import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../../api/healthApi'
import type { DayMealSummary, HealthGoal } from '../../types'
import { BodyPanel } from '../BodyPanel'
import {
  estimateBodyFatPct,
  useWebGLOk,
  type AtlasRegion,
  type BodyLayer,
} from './body3d/Body3DCanvas'

const Body3DCanvas = lazy(() =>
  import('./body3d/Body3DCanvas').then((m) => ({ default: m.Body3DCanvas })),
)

const LAYERS: BodyLayer[] = ['fat', 'vessels', 'bone']

export function Body3DPanel({
  summary,
  goal,
  onSaveWeight,
  saving,
}: {
  summary: DayMealSummary
  goal?: HealthGoal | null
  onSaveWeight: (kg: number) => void
  saving?: boolean
}) {
  const webgl = useWebGLOk()
  const [layer, setLayer] = useState<BodyLayer>('fat')
  const [selectedId, setSelectedId] = useState<string | null>('abdomen')

  const atlas = useQuery({
    queryKey: ['health', 'body', 'atlas'],
    queryFn: () => healthApi.bodyAtlas(),
    staleTime: 60_000 * 60,
  })

  const bodyFat = useMemo(() => {
    if (summary.bmi == null) return null
    const age = goal?.age_years ?? 30
    const sex = goal?.sex ?? 'male'
    return estimateBodyFatPct(summary.bmi, age, sex)
  }, [summary.bmi, goal?.age_years, goal?.sex])

  const regions = (atlas.data?.regions ?? []) as AtlasRegion[]
  const selected = regions.find((r) => r.id === selectedId) ?? regions[0]
  const tip = selected?.tips.find((t) => t.layer === layer)
  const citations = atlas.data?.citations ?? []
  const tipCitations = tip
    ? citations.filter((c) => tip.citation_ids.includes(c.id))
    : []

  if (!webgl) {
    return (
      <BodyPanel summary={summary} onSaveWeight={onSaveWeight} saving={saving} />
    )
  }

  return (
    <aside className="grg-board__body grg-body3d">
      <p className="grg-eyebrow">Body atlas</p>
      <div className="grg-btn-row" style={{ marginBottom: '0.65rem' }}>
        {LAYERS.map((l) => (
          <button
            key={l}
            type="button"
            className={layer === l ? 'grg-btn' : 'grg-btn grg-btn--ghost'}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.72rem' }}
            onClick={() => setLayer(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grg-body3d__canvas">
        <Suspense fallback={<div className="grg-hint">Loading 3D…</div>}>
          <Body3DCanvas
            regions={regions}
            layer={layer}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </Suspense>
      </div>

      <div className="grg-stat-grid" style={{ marginTop: '0.85rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <div className="grg-stat-value">{summary.bmi ?? '—'}</div>
          <div className="grg-stat-label">BMI</div>
        </div>
        <div>
          <div className="grg-stat-value">{bodyFat != null ? `${bodyFat}%` : '—'}</div>
          <div className="grg-stat-label">eBF%*</div>
        </div>
        <div>
          <div className="grg-stat-value">
            {summary.remaining_kcal != null ? Math.round(summary.remaining_kcal) : '—'}
          </div>
          <div className="grg-stat-label">Kcal left</div>
        </div>
        <div>
          <div className="grg-stat-value">
            {Math.round(summary.protein_g)}
            {summary.protein_g_target != null ? `/${summary.protein_g_target}` : ''}
          </div>
          <div className="grg-stat-label">Protein g</div>
        </div>
      </div>

      {tip && (
        <div className="grg-panel" style={{ marginTop: '0.85rem', padding: '0.85rem' }}>
          <p className="grg-eyebrow">{selected?.label ?? 'Region'}</p>
          <p className="grg-hint" style={{ margin: 0 }}>
            {tip.text}
          </p>
          {tipCitations.length > 0 && (
            <ul style={{ margin: '0.55rem 0 0', paddingLeft: '1rem' }}>
              {tipCitations.map((c) => (
                <li key={c.id} style={{ marginBottom: 4 }}>
                  <a href={c.url} target="_blank" rel="noreferrer">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="grg-hint" style={{ marginTop: '0.75rem' }}>
        {atlas.data?.disclaimer ??
          'Educational estimates only — not a diagnosis.'}
        {' '}
        *eBF% from BMI (Deurenberg-style).
      </p>

      {(atlas.data?.future_conditions?.length ?? 0) > 0 && (
        <details style={{ marginTop: '0.75rem' }}>
          <summary className="grg-label" style={{ cursor: 'pointer' }}>
            Roadmap: blood / fat / bone conditions
          </summary>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem', color: 'var(--grg-muted)' }}>
            {atlas.data!.future_conditions.map((c) => (
              <li key={c.id} style={{ marginBottom: 6 }}>
                <strong style={{ color: 'var(--grg-title)' }}>{c.label}</strong> — {c.note}
              </li>
            ))}
          </ul>
        </details>
      )}

      <form
        className="grg-stack"
        style={{ marginTop: '1rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const kg = Number(fd.get('weight'))
          if (kg > 0) onSaveWeight(kg)
        }}
      >
        <label className="grg-label" htmlFor="daily-wt-3d">
          Today&apos;s weight
        </label>
        <input
          id="daily-wt-3d"
          name="weight"
          className="grg-input"
          defaultValue={summary.weight_kg_today ?? ''}
          placeholder="kg"
          inputMode="decimal"
        />
        <button type="submit" className="grg-btn grg-btn--block" disabled={saving}>
          {saving ? 'Saving…' : 'Update weight'}
        </button>
      </form>
    </aside>
  )
}
