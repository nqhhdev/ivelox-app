import { lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/healthApi'
import type { DayMealSummary, HealthGoal } from '../types'
import {
  estimateBodyFatPct,
  healthScore,
  JOINTS,
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
  { id: 'vessels', label: 'Blood vessels' },
  { id: 'organs', label: 'Organs' },
  { id: 'visceral_fat', label: 'Visceral fat' },
  { id: 'nerves', label: 'Nerves' },
]

const MODE_OPTS: { id: AnatomyLayer; label: string }[] = [
  { id: 'skin', label: 'Glass' },
  { id: 'vessels', label: 'Blood' },
  { id: 'visceral_fat', label: 'Fat' },
  { id: 'skeleton', label: 'Bone' },
  { id: 'muscles', label: 'Muscle' },
]

function statusClass(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('not') || s === '—') return 'med-status--muted'
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
  mealsSlot,
}: {
  summary: DayMealSummary
  goal?: HealthGoal | null
  onSaveWeight: (kg: number) => void
  saving?: boolean
  onLogMeal: () => void
  onLogBurn: () => void
  onGoals: () => void
  onCloseDay: () => void
  mealsSlot?: ReactNode
}) {
  const webgl = useWebGLOk()
  const [section, setSection] = useState<Section>('anatomy')
  const [layer, setLayer] = useState<AnatomyLayer>('skin')
  const [picked, setPicked] = useState<{ name: string; type: string; label: string } | null>(null)
  const [activeJoint, setActiveJoint] = useState<string | null>('knee')
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

  const joint = JOINTS.find((j) => j.id === activeJoint) ?? JOINTS[2]
  const showJoints = section === 'joints'

  const setSectionAndLayer = (id: Section) => {
    setSection(id)
    if (id === 'blood') setLayer('vessels')
    if (id === 'fat') setLayer('visceral_fat')
    if (id === 'bones' || id === 'joints') setLayer('skeleton')
  }

  return (
    <div className="med-dash">
      <header className="med-top">
        <div>
          <p className="med-kicker">Health · body atlas</p>
          <h1>Body analytics</h1>
        </div>
        <div className="med-top__actions">
          <button type="button" className="grg-btn" onClick={onLogMeal}>
            + Log meal
          </button>
          <button type="button" className="grg-btn grg-btn--ghost" onClick={onLogBurn}>
            Log burn
          </button>
          <button type="button" className="grg-btn grg-btn--ghost" onClick={onGoals}>
            Goals
          </button>
          <button
            type="button"
            className="grg-btn grg-btn--quiet"
            disabled={summary.day_closed}
            onClick={onCloseDay}
          >
            {summary.day_closed ? 'Day closed' : 'Close day'}
          </button>
        </div>
      </header>

      <div className="med-board">
        <aside className="med-rail">
          <div className="med-profile">
            <div className="med-avatar">IV</div>
            <div>
              <strong>Owner</strong>
              <div className="med-muted">
                Age {goal?.age_years ?? '—'} · {goal?.sex ?? '—'}
              </div>
            </div>
          </div>

          <nav className="med-nav">
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
                onClick={() => setSectionAndLayer(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="med-rail__block">
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
          </div>
        </aside>

        <section className="med-stage">
          <div className="med-stage__modes">
            {MODE_OPTS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={layer === m.id ? 'is-active' : ''}
                onClick={() => {
                  setLayer(m.id)
                  setSection('anatomy')
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="med-viewport">
            {webgl ? (
              <Suspense fallback={<div className="med-loading">Loading 3D…</div>}>
                <AnatomyCanvas
                  layer={layer}
                  showJoints={showJoints}
                  activeJointId={activeJoint}
                  onPick={(name, type, label) =>
                    setPicked({ name, type, label: label ?? name })
                  }
                  onJointSelect={setActiveJoint}
                />
              </Suspense>
            ) : (
              <div className="med-loading">WebGL unavailable — use a desktop browser.</div>
            )}
            <div className="med-viewport__hint">
              Glass body · hover/click a muscle or bone to highlight
              {showJoints ? ' · tap a ring for joint' : ''}
            </div>
          </div>

          {(picked || tip) && !showJoints && (
            <p className="med-inspect-line">
              <span>{picked?.label ?? picked?.name ?? 'Tip'}</span>
              {picked ? ` · ${picked.type}` : ''}
              {tip ? ` — ${tip}` : ''}
            </p>
          )}
        </section>

        <aside className="med-analytics">
          {section === 'overview' && (
            <>
              <div className="med-block">
                <p className="med-kicker">Today</p>
                <div className="med-stat-row">
                  <div>
                    <div className="med-stat-val">{Math.round(summary.eaten_kcal)}</div>
                    <div className="med-muted">Kcal</div>
                  </div>
                  <div>
                    <div className="med-stat-val">
                      {summary.remaining_kcal == null ? '—' : Math.round(summary.remaining_kcal)}
                    </div>
                    <div className="med-muted">Left</div>
                  </div>
                  <div>
                    <div className="med-stat-val">{Math.round(summary.protein_g)}</div>
                    <div className="med-muted">Protein</div>
                  </div>
                </div>
              </div>
              <div className="med-block med-block--score">
                <p className="med-kicker">Health score</p>
                <div className="med-ring med-ring--lg" style={{ ['--p' as string]: `${score}%` }}>
                  <span>{score}</span>
                </div>
                <div className={`med-status ${statusClass(scoreLabel)}`}>{scoreLabel}</div>
              </div>
              <div className="med-block">
                <p className="med-kicker">Visceral fat (est.)</p>
                <div className="med-scoreline">
                  <strong>{vf}/100</strong>
                  <span className={`med-status ${statusClass(vfLabel)}`}>{vfLabel}</span>
                </div>
                <div className="med-bar">
                  <div style={{ width: `${vf}%` }} />
                </div>
              </div>
            </>
          )}

          {section === 'anatomy' && (
            <>
              <div className="med-block">
                <p className="med-kicker">Layer focus</p>
                <p className="med-muted" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.45 }}>
                  {tip ?? 'Rotate the model and switch layers. Educational CC BY-SA anatomy — not a clinical scan.'}
                </p>
              </div>
              <div className="med-block">
                <p className="med-kicker">Today nutrition</p>
                <div className="med-stat-row">
                  <div>
                    <div className="med-stat-val">{Math.round(summary.eaten_kcal)}</div>
                    <div className="med-muted">Kcal</div>
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
              <div className="med-block med-block--score">
                <p className="med-kicker">Score</p>
                <div className="med-ring med-ring--lg" style={{ ['--p' as string]: `${score}%` }}>
                  <span>{score}</span>
                </div>
                <div className={`med-status ${statusClass(scoreLabel)}`}>{scoreLabel}</div>
              </div>
            </>
          )}

          {section === 'blood' && (
            <div className="med-block">
              <p className="med-kicker">Blood metrics</p>
              <p className="med-fineprint">Lab values not linked yet</p>
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

          {section === 'fat' && (
            <div className="med-block">
              <p className="med-kicker">Visceral fat</p>
              <div className="med-scoreline">
                <strong>{vf}/100</strong>
                <span className={`med-status ${statusClass(vfLabel)}`}>{vfLabel}</span>
              </div>
              <div className="med-bar">
                <div style={{ width: `${vf}%` }} />
              </div>
              <p className="med-muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
                From BMI {summary.bmi ?? '—'}
                {ebf != null ? ` · eBF ${ebf}%` : ''}. Not imaging.
              </p>
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
                  className="grg-input"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Today's weight"
                  inputMode="decimal"
                />
                <button type="submit" className="grg-btn" disabled={saving}>
                  {saving ? '…' : 'Update'}
                </button>
              </form>
            </div>
          )}

          {section === 'bones' && (
            <div className="med-block">
              <p className="med-kicker">Bone health</p>
              <div className="med-metric-list">
                <Ring value={null} label="T-score" status="Not linked" />
                <Ring value={null} label="Calcium / P" status="Not linked" />
              </div>
              <p className="med-muted" style={{ fontSize: '0.78rem' }}>
                Fracture risk: — · DEXA not connected
              </p>
            </div>
          )}

          {section === 'joints' && (
            <div className="med-block">
              <p className="med-kicker">Joint · {joint.label}</p>
              <div className="med-joint-list">
                {JOINTS.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    className={activeJoint === j.id ? 'is-active' : ''}
                    onClick={() => setActiveJoint(j.id)}
                  >
                    {j.label}
                  </button>
                ))}
              </div>
              <div className="med-metric-list" style={{ marginTop: 10 }}>
                <Ring value={null} label="Mobility" status="—" />
                <Ring value={null} label="Inflammation" status="Not linked" />
              </div>
              <p className="med-fineprint">Wearables / labs not linked — markers are placeholders.</p>
            </div>
          )}

          <p className="med-fineprint med-attrib">
            Model: Z-Anatomy / hpfrei · CC BY-SA 4.0
          </p>
        </aside>
      </div>

      {mealsSlot ? <div className="med-meals">{mealsSlot}</div> : null}
    </div>
  )
}
