import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/healthApi'
import type { DayMealSummary, HealthGoal } from '../types'
import {
  estimateBodyFatPct,
  healthScore,
  useWebGLOk,
  visceralFatScore,
  type AnatomyLayer,
} from './body3d/bodyMetrics'

const AnatomyCanvas = lazy(() =>
  import('./body3d/AnatomyCanvas').then((m) => ({ default: m.AnatomyCanvas })),
)

type Section = 'overview' | 'anatomy' | 'blood' | 'fat' | 'bones' | 'joints'

const LAYER_OPTS: { id: AnatomyLayer; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'muscles', label: 'Muscles' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'vessels', label: 'Blood Vessels' },
  { id: 'organs', label: 'Organs' },
  { id: 'visceral_fat', label: 'Visceral Fat' },
  { id: 'nerves', label: 'Nerves' },
]

function statusClass(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('not')) return 'med-status--muted'
  if (s.includes('mod')) return 'med-status--moderate'
  if (s.includes('high') || s.includes('watch')) return 'med-status--high'
  if (s.includes('good') || s.includes('low') || s.includes('fair') || s.includes('normal')) {
    return 'med-status--good'
  }
  return 'med-status--muted'
}

function Ring({
  value,
  max = 100,
  label,
  status,
}: {
  value: number | null
  max?: number
  label: string
  status: string
}) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="med-metric">
      <div className="med-ring" style={{ ['--p' as string]: `${pct}%` }}>
        <span>{value == null ? '—' : value}</span>
      </div>
      <div>
        <div className="med-metric__label">{label}</div>
        <div className={`med-status ${statusClass(status)}`}>{status}</div>
      </div>
    </div>
  )
}

export function MedicalAnalyticsDashboard({
  summary,
  goal,
  onSaveWeight,
  saving,
  onLogMeal,
  onLogBurn,
  onGoals,
  onCloseDay,
}: {
  summary: DayMealSummary
  goal?: HealthGoal | null
  onSaveWeight: (kg: number) => void
  saving?: boolean
  onLogMeal: () => void
  onLogBurn: () => void
  onGoals: () => void
  onCloseDay: () => void
}) {
  const webgl = useWebGLOk()
  const [section, setSection] = useState<Section>('anatomy')
  const [layer, setLayer] = useState<AnatomyLayer>('vessels')
  const [picked, setPicked] = useState<{ name: string; type: string } | null>(null)
  const [weight, setWeight] = useState(
    summary.weight_kg_today != null ? String(summary.weight_kg_today) : '',
  )

  const atlas = useQuery({
    queryKey: ['health', 'body', 'atlas'],
    queryFn: () => healthApi.bodyAtlas(),
    staleTime: 3_600_000,
  })

  const ebf = useMemo(() => {
    if (summary.bmi == null) return null
    return estimateBodyFatPct(summary.bmi, goal?.age_years ?? 30, goal?.sex ?? 'male')
  }, [summary.bmi, goal?.age_years, goal?.sex])

  const vf = visceralFatScore(summary.bmi, ebf)
  const vfLabel = vf < 35 ? 'Low' : vf < 55 ? 'Moderate' : 'High'
  const score = healthScore({
    remainingKcal: summary.remaining_kcal,
    dailyTarget: summary.daily_kcal_target,
    proteinG: summary.protein_g,
    proteinTarget: summary.protein_g_target,
    burned: summary.burned_kcal ?? 0,
  })
  const scoreLabel = score >= 85 ? 'Good' : score >= 70 ? 'Fair' : 'Watch'

  const tip =
    atlas.data?.regions
      ?.find((r) => r.id === 'abdomen')
      ?.tips.find((t) =>
        layer === 'vessels' || layer === 'visceral_fat'
          ? t.layer === (layer === 'vessels' ? 'vessels' : 'fat')
          : t.layer === (layer === 'skeleton' || layer === 'nerves' ? 'bone' : 'fat'),
      )?.text

  return (
    <div className="med-dash">
      <header className="med-top">
        <div>
          <p className="med-kicker">iVelox Health</p>
          <h1>BODY 3D MEDICAL HEALTH ANALYTICS</h1>
        </div>
        <div className="med-top__actions">
          <button type="button" className="med-btn" onClick={onLogMeal}>
            + Log meal
          </button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onLogBurn}>
            Log burn
          </button>
          <button type="button" className="med-btn med-btn--ghost" onClick={onGoals}>
            Goals
          </button>
          <button
            type="button"
            className="med-btn med-btn--ghost"
            disabled={summary.day_closed}
            onClick={onCloseDay}
          >
            {summary.day_closed ? 'Day closed' : 'Close day'}
          </button>
        </div>
      </header>

      <div className="med-grid">
        {/* LEFT */}
        <aside className="med-side">
          <div className="med-card">
            <p className="med-kicker">Profile</p>
            <div className="med-profile">
              <div className="med-avatar">IV</div>
              <div>
                <strong>Owner</strong>
                <div className="med-muted">
                  Age {goal?.age_years ?? '—'} · {goal?.sex ?? '—'}
                </div>
              </div>
            </div>
          </div>

          <nav className="med-card med-nav">
            {(
              [
                ['overview', 'Overview'],
                ['anatomy', 'Anatomy'],
                ['blood', 'Blood'],
                ['fat', 'Fat'],
                ['bones', 'Bones'],
                ['joints', 'Joints'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={section === id ? 'is-active' : ''}
                onClick={() => setSection(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="med-card">
            <p className="med-kicker">Scan summary</p>
            <div className="med-muted" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
              Source: daily logs + goals
              <br />
              Type: Full body analytics (estimated)
              <br />
              Device: — (not linked)
            </div>
          </div>

          <div className="med-card">
            <p className="med-kicker">Layers</p>
            <div className="med-layers">
              {LAYER_OPTS.map((l) => (
                <label key={l.id} className="med-check">
                  <input
                    type="radio"
                    name="layer"
                    checked={layer === l.id}
                    onChange={() => {
                      setLayer(l.id)
                      setSection('anatomy')
                    }}
                  />
                  {l.label}
                </label>
              ))}
            </div>
            <div className="med-legend">
              <span><i style={{ background: '#c23b3b' }} /> Arteries</span>
              <span><i style={{ background: '#3a6cff' }} /> Veins</span>
              <span><i style={{ background: '#e6d84a' }} /> Nerves</span>
              <span><i style={{ background: '#e8e2d6' }} /> Bone</span>
            </div>
          </div>
        </aside>

        {/* CENTER */}
        <section className="med-stage">
          <div className="med-stage__modes">
            {(['vessels', 'visceral_fat', 'skeleton', 'muscles'] as AnatomyLayer[]).map((m) => (
              <button
                key={m}
                type="button"
                className={layer === m ? 'is-active' : ''}
                onClick={() => setLayer(m)}
              >
                {m === 'vessels'
                  ? 'Blood Flow'
                  : m === 'visceral_fat'
                    ? 'Visceral Fat'
                    : m === 'skeleton'
                      ? 'Skeleton'
                      : 'Muscles'}
              </button>
            ))}
          </div>

          <div className="med-viewport">
            {webgl ? (
              <Suspense fallback={<div className="med-loading">Loading 3D…</div>}>
                <AnatomyCanvas layer={layer} onPick={(name, type) => setPicked({ name, type })} />
              </Suspense>
            ) : (
              <div className="med-loading">WebGL unavailable — use a desktop browser.</div>
            )}
            <div className="med-viewport__hint">
              Drag to rotate · Scroll to zoom · Right-drag to pan · Click structure to inspect
            </div>
          </div>

          {(picked || tip) && (
            <div className="med-card med-inspect">
              <p className="med-kicker">{picked?.name || 'Region tip'}</p>
              <p className="med-muted" style={{ margin: 0 }}>
                {picked ? `Type: ${picked.type}` : null}
                {tip ? ` — ${tip}` : null}
              </p>
              <p className="med-fineprint">
                Educational model (CC BY-SA, Z-Anatomy / hpfrei). Not a clinical scan.
              </p>
            </div>
          )}
        </section>

        {/* RIGHT */}
        <aside className="med-side med-side--analytics">
          {(section === 'overview' || section === 'blood' || section === 'anatomy') && (
            <div className="med-card">
              <p className="med-kicker">Blood metrics</p>
              <div className="med-muted med-fineprint" style={{ marginBottom: 8 }}>
                Lab values not linked yet
              </div>
              <div className="med-metric-list">
                <Ring value={null} label="Hemoglobin" status="Not linked" />
                <Ring value={null} label="RBC" status="Not linked" />
                <Ring value={null} label="WBC" status="Not linked" />
                <Ring value={null} label="Platelets" status="Not linked" />
                <Ring value={null} label="Blood pressure" status="Not linked" />
                <Ring value={null} label="SpO₂" status="Not linked" />
              </div>
            </div>
          )}

          {(section === 'overview' || section === 'fat' || section === 'anatomy') && (
            <div className="med-card">
              <p className="med-kicker">Visceral fat analysis</p>
              <div className="med-scoreline">
                <strong>{vf}/100</strong>
                <span className={`med-status ${statusClass(vfLabel)}`}>{vfLabel}</span>
              </div>
              <div className="med-bar">
                <div style={{ width: `${vf}%` }} />
              </div>
              <div className="med-muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
                Estimated from BMI {summary.bmi ?? '—'}
                {ebf != null ? ` · eBF ${ebf}%` : ''} (Deurenberg-style). Not imaging.
              </div>
              <div className="med-stat-row">
                <div>
                  <div className="med-stat-val">{summary.weight_kg_today ?? '—'}</div>
                  <div className="med-muted">Weight kg</div>
                </div>
                <div>
                  <div className="med-stat-val">{summary.target_weight_kg ?? '—'}</div>
                  <div className="med-muted">Target</div>
                </div>
              </div>
              <form
                className="med-weight"
                onSubmit={(e) => {
                  e.preventDefault()
                  const kg = Number(weight)
                  if (kg > 0) onSaveWeight(kg)
                }}
              >
                <input
                  className="med-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Today's weight"
                  inputMode="decimal"
                />
                <button type="submit" className="med-btn" disabled={saving}>
                  {saving ? '…' : 'Update'}
                </button>
              </form>
            </div>
          )}

          {(section === 'overview' || section === 'bones' || section === 'anatomy') && (
            <div className="med-card">
              <p className="med-kicker">Bone health</p>
              <div className="med-metric-list">
                <Ring value={null} label="T-score" status="Not linked" />
                <Ring value={null} label="Calcium / P" status="Not linked" />
              </div>
              <div className="med-muted" style={{ fontSize: '0.78rem' }}>
                Fracture risk: — · Spine alignment: — (DEXA not connected)
              </div>
            </div>
          )}

          {(section === 'overview' || section === 'joints' || section === 'anatomy') && (
            <div className="med-card">
              <p className="med-kicker">Joint health</p>
              <div className="med-metric-list">
                <Ring value={null} label="Inflammation mg/L" status="Not linked" />
                <Ring value={null} label="Mobility score" status="—" />
              </div>
              <div className="med-muted" style={{ fontSize: '0.78rem' }}>
                Pain risk: — · Tap joint markers on the model for placeholders.
              </div>
            </div>
          )}

          <div className="med-card">
            <p className="med-kicker">Today nutrition</p>
            <div className="med-stat-row">
              <div>
                <div className="med-stat-val">{Math.round(summary.eaten_kcal)}</div>
                <div className="med-muted">Kcal eaten</div>
              </div>
              <div>
                <div className="med-stat-val">
                  {summary.remaining_kcal == null ? '—' : Math.round(summary.remaining_kcal)}
                </div>
                <div className="med-muted">Left</div>
              </div>
              <div>
                <div className="med-stat-val">
                  {Math.round(summary.protein_g)}
                  {summary.protein_g_target != null ? `/${summary.protein_g_target}` : ''}
                </div>
                <div className="med-muted">Protein</div>
              </div>
            </div>
          </div>

          <div className="med-card med-card--score">
            <p className="med-kicker">Overall health score</p>
            <div className="med-ring med-ring--lg" style={{ ['--p' as string]: `${score}%` }}>
              <span>{score}</span>
            </div>
            <div className={`med-status ${statusClass(scoreLabel)}`}>{scoreLabel}</div>
            <div className="med-fineprint">From kcal adherence, protein, and activity — not a diagnosis.</div>
          </div>

          <div className="med-bottom-actions">
            <button type="button" className="med-btn med-btn--ghost" disabled>
              Export data
            </button>
            <button type="button" className="med-btn med-btn--ghost" disabled>
              Generate report
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
