import { useState } from 'react'
import type { DayMealSummary, HealthGoal, MealLog } from '../types'
import { MealList } from './MealList'
import { MealPlanList } from './MealPlanList'
import { formatBoardDate, localISODate, shiftISODate } from '../lib/date'

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function MacroRow({
  label,
  eaten,
  target,
}: {
  label: string
  eaten: number
  target?: number | null
}) {
  const pct = target && target > 0 ? Math.min(100, (eaten / target) * 100) : 0
  return (
    <div className="hb-macro">
      <div className="hb-macro__top">
        <span>{label}</span>
        <span>
          {fmt(eaten)}
          {target != null ? ` / ${target}g` : 'g'}
        </span>
      </div>
      <div className="hb-macro__track">
        <div className="hb-macro__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function HealthBoard({
  date,
  onDateChange,
  summary,
  goal,
  meals,
  mealsLoading,
  deletingId,
  onDeleteMeal,
  onStatus,
  onLogMeal,
  onLogBurn,
  onGoals,
  onCloseDay,
  onSaveWeight,
  savingWeight,
}: {
  date: string
  onDateChange: (date: string) => void
  summary: DayMealSummary
  goal?: HealthGoal | null
  meals: MealLog[]
  mealsLoading?: boolean
  deletingId?: string | null
  onDeleteMeal: (id: string) => void
  onStatus: (mealType: string, status: 'done' | 'skipped' | 'planned') => void
  onLogMeal: () => void
  onLogBurn: () => void
  onGoals: () => void
  onCloseDay: () => void
  onSaveWeight: (kg: number) => void
  savingWeight?: boolean
}) {
  const today = localISODate()
  const isToday = date === today
  const remaining = summary.remaining_kcal
  const target = summary.daily_kcal_target
  const [weight, setWeight] = useState(
    summary.weight_kg_today != null ? String(summary.weight_kg_today) : '',
  )
  const [lastWeightKey, setLastWeightKey] = useState(`${date}:${summary.weight_kg_today}`)
  const weightKey = `${date}:${summary.weight_kg_today}`
  if (weightKey !== lastWeightKey) {
    setLastWeightKey(weightKey)
    setWeight(summary.weight_kg_today != null ? String(summary.weight_kg_today) : '')
  }

  return (
    <div className="hb">
      <header className="hb-header">
        <div>
          <p className="hb-kicker">Health board</p>
          <h1>How&apos;s your day?</h1>
        </div>
        <div className="hb-date">
          <button
            type="button"
            className="hb-date__nav"
            aria-label="Previous day"
            onClick={() => onDateChange(shiftISODate(date, -1))}
          >
            ‹
          </button>
          <label className="hb-date__picker">
            <span className="hb-date__label">{formatBoardDate(date)}</span>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => {
                if (e.target.value) onDateChange(e.target.value)
              }}
            />
          </label>
          <button
            type="button"
            className="hb-date__nav"
            aria-label="Next day"
            disabled={isToday}
            onClick={() => onDateChange(shiftISODate(date, 1))}
          >
            ›
          </button>
          <button
            type="button"
            className="hb-link"
            disabled={isToday}
            aria-hidden={isToday}
            tabIndex={isToday ? -1 : 0}
            onClick={() => onDateChange(today)}
          >
            Today
          </button>
        </div>
      </header>

      <div className="hb-actions">
        <button type="button" className="hb-btn hb-btn--primary" onClick={onLogMeal}>
          <span className="hb-btn__plus" aria-hidden>
            +
          </span>
          Log meal
        </button>
        <div className="hb-actions__chips">
          <button type="button" className="hb-chip" onClick={onLogBurn}>
            Log burn
          </button>
          <button type="button" className="hb-chip" onClick={onGoals}>
            Goals
          </button>
          <button
            type="button"
            className="hb-chip hb-chip--muted"
            disabled={summary.day_closed}
            onClick={onCloseDay}
          >
            {summary.day_closed ? 'Day closed' : 'Close day'}
          </button>
        </div>
      </div>

      <div className="hb-banner-slot">
        {!isToday ? (
          <p className="hb-banner">
            Editing <strong>{formatBoardDate(date)}</strong> — logs and weight apply to that day.
          </p>
        ) : null}
      </div>

      <div className="hb-grid">
        <section className="hb-card hb-card--hero">
          <p className="hb-kicker">Calories left</p>
          <div className="hb-hero-num">
            {remaining == null ? '—' : fmt(remaining)}
            <span>kcal</span>
          </div>
          <p className="hb-muted">
            Eaten {fmt(summary.eaten_kcal)}
            {target != null ? ` of ${target}` : ''}
            {(summary.burned_kcal ?? 0) > 0 ? ` · burned ${fmt(summary.burned_kcal!)}` : ''}
          </p>
          {summary.tip && <p className="hb-tip">{summary.tip}</p>}
        </section>

        <section className="hb-card">
          <p className="hb-kicker">Protein</p>
          <div className="hb-stat-big">
            {fmt(summary.protein_g)}
            {summary.protein_g_target != null ? (
              <span className="hb-muted"> / {summary.protein_g_target}g</span>
            ) : (
              <span className="hb-muted"> g</span>
            )}
          </div>
          <MacroRow
            label="Protein"
            eaten={summary.protein_g}
            target={summary.protein_g_target}
          />
          <MacroRow label="Carbs" eaten={summary.carb_g} target={summary.carb_g_target} />
          <MacroRow label="Fat" eaten={summary.fat_g} target={summary.fat_g_target} />
        </section>

        <section className="hb-card">
          <p className="hb-kicker">Body</p>
          <div className="hb-body-row">
            <div>
              <div className="hb-stat-big">{summary.bmi ?? '—'}</div>
              <div className="hb-muted">{summary.bmi_category ?? 'BMI'}</div>
            </div>
            <div>
              <div className="hb-stat-big">{summary.weight_kg_today ?? '—'}</div>
              <div className="hb-muted">kg · target {summary.target_weight_kg ?? goal?.target_weight_kg ?? '—'}</div>
            </div>
          </div>
          <form
            className="hb-weight"
            onSubmit={(e) => {
              e.preventDefault()
              const kg = Number(weight)
              if (kg > 0) onSaveWeight(kg)
            }}
          >
            <input
              className="hb-input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight kg"
              inputMode="decimal"
              aria-label="Weight in kg"
            />
            <button type="submit" className="hb-btn" disabled={savingWeight}>
              {savingWeight ? '…' : 'Save'}
            </button>
          </form>
        </section>
      </div>

      {(summary.deficit_tips?.length ?? 0) > 0 && (
        <section className="hb-card hb-tips">
          <p className="hb-kicker">Tips</p>
          <ul>
            {summary.deficit_tips!.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="hb-card">
        <div className="hb-section-head">
          <h2>Meal targets</h2>
          <span className="hb-muted">{summary.meal_count} logged</span>
        </div>
        <MealPlanList slots={summary.meal_plan ?? []} onStatus={onStatus} />
      </section>

      <section className="hb-card">
        <div className="hb-section-head">
          <h2>Logged meals</h2>
        </div>
        {mealsLoading ? (
          <p className="hb-muted">Loading…</p>
        ) : (
          <MealList
            meals={meals}
            deletingId={deletingId}
            onDelete={onDeleteMeal}
          />
        )}
      </section>
    </div>
  )
}
