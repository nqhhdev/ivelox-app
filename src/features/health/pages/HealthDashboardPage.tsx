import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { localISODate } from '../lib/date'
import { useMeals } from '../hooks/useMeals'
import { useTodaySummary } from '../hooks/useTodaySummary'
import { useMealLog } from '../hooks/useMealLog'
import { MealList } from '../components/MealList'
import { MealPlanList } from '../components/MealPlanList'
import { MedicalAnalyticsDashboard } from '../components/MedicalAnalyticsDashboard'
import { BoardModal } from '../components/BoardModal'
import { MealLogForm } from '../components/MealLogForm'
import { ResolvePreview } from '../components/ResolvePreview'
import { HealthNavLinks } from '../components/HealthNavLinks'
import { healthApi } from '../api/healthApi'
import { GoalsForm } from './GoalsPage'
import { useState } from 'react'
import type { DayMealSummary, FoodUnit } from '../types'

type Panel = 'log' | 'goals' | 'burns' | null

export function HealthDashboardPage() {
  const date = localISODate()
  const toast = useToast()
  const qc = useQueryClient()
  const summary = useTodaySummary(date)
  const meals = useMeals(date)
  const goal = useQuery({
    queryKey: ['health', 'goals'],
    queryFn: () => healthApi.getGoal(),
    retry: false,
  })
  const signOut = useAuthStore((s) => s.signOut)
  const [panel, setPanel] = useState<Panel>(null)
  const [burnName, setBurnName] = useState('walking')
  const [burnMin, setBurnMin] = useState('30')

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['health'] })
  }

  const log = useMealLog({
    embedded: true,
    onLogged: () => {
      setPanel(null)
      refresh()
    },
  })

  const weightMut = useMutation({
    mutationFn: (kg: number) => healthApi.dailyWeight({ date, weight_kg: kg }),
    onSuccess: () => {
      toast.success('Weight updated')
      refresh()
    },
    onError: (e) => toast.error(e, 'Could not save weight.'),
  })

  const slotMut = useMutation({
    mutationFn: (p: { meal_type: string; status: string }) =>
      healthApi.setMealSlot({ date, ...p }),
    onSuccess: () => refresh(),
    onError: (e) => toast.error(e, 'Could not update meal slot.'),
  })

  const closeMut = useMutation({
    mutationFn: () => healthApi.closeDay(date),
    onSuccess: (data) => {
      toast.success('Day closed')
      refresh()
      if (data.tips?.length) {
        data.tips.forEach((t) => toast.success(t))
      }
    },
    onError: (e) => toast.error(e, 'Could not close day.'),
  })

  const burnMut = useMutation({
    mutationFn: () =>
      healthApi.createBurn({
        activity_name: burnName,
        duration_min: Number(burnMin) || 30,
      }),
    onSuccess: () => {
      toast.success('Burn logged')
      setPanel(null)
      refresh()
    },
    onError: (e) => toast.error(e, 'Could not log burn.'),
  })

  const emptySummary: DayMealSummary = {
    eaten_kcal: 0,
    protein_g: 0,
    carb_g: 0,
    fat_g: 0,
    meal_count: 0,
  }

  const data = summary.data ?? emptySummary
  const values = log.form.watch()

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
    >
      {summary.isError && (
        <p className="grg-error" style={{ padding: '0 1.25rem' }}>
          Could not load today&apos;s summary.
        </p>
      )}

      <MedicalAnalyticsDashboard
        summary={data}
        goal={goal.data}
        saving={weightMut.isPending}
        onSaveWeight={(kg) => weightMut.mutate(kg)}
        onLogMeal={() => setPanel('log')}
        onLogBurn={() => setPanel('burns')}
        onGoals={() => setPanel('goals')}
        onCloseDay={() => closeMut.mutate()}
      />

      <div className="med-dash" style={{ paddingTop: 0 }}>
        <div className="med-card" style={{ maxWidth: 1100, margin: '0 auto 1.5rem' }}>
          <p className="med-kicker">{date} · Meal targets & logs</p>
          <MealPlanList
            slots={data.meal_plan ?? []}
            onStatus={(meal_type, status) => slotMut.mutate({ meal_type, status })}
          />
          <div style={{ height: 12 }} />
          {meals.list.isLoading ? (
            <p className="med-muted">Loading meals…</p>
          ) : (
            <MealList
              meals={meals.list.data ?? []}
              deletingId={meals.remove.isPending ? meals.remove.variables : null}
              onDelete={(id) => {
                if (!window.confirm('Delete this meal?')) return
                meals.remove.mutate(id, {
                  onError: (e) => toast.error(e, 'Could not delete meal.'),
                })
              }}
            />
          )}
        </div>
      </div>

      {panel === 'log' && (
        <BoardModal title="Log meal" onClose={() => setPanel(null)}>
          <p className="grg-hint" style={{ marginBottom: '0.75rem' }}>
            Text helps, but a photo is better when the name is unclear.
          </p>
          {log.preview ? (
            <ResolvePreview
              items={log.scaledItems}
              source={log.preview.source}
              notes={log.preview.notes}
              quantity={log.previewQty}
              unit={values.unit}
              confirming={log.confirming}
              onQuantityChange={log.setPreviewQty}
              onConfirm={() => {
                void log.onConfirm()
              }}
              onBack={log.onBack}
            />
          ) : (
            <MealLogForm
              text={values.text ?? ''}
              quantity={values.quantity}
              unit={values.unit}
              mealType={values.meal_type}
              imageName={log.imageFile?.name}
              error={log.form.formState.errors.text?.message}
              submitting={log.resolving}
              onTextChange={(v) => log.form.setValue('text', v, { shouldValidate: true })}
              onQuantityChange={(v) => log.form.setValue('quantity', v, { shouldValidate: true })}
              onUnitChange={(v: FoodUnit) => log.form.setValue('unit', v, { shouldValidate: true })}
              onMealTypeChange={(v) => log.form.setValue('meal_type', v, { shouldValidate: true })}
              onImageChange={log.setImage}
              onSubmit={() => {
                void log.onResolve()
              }}
            />
          )}
        </BoardModal>
      )}

      {panel === 'burns' && (
        <BoardModal title="Log burn" onClose={() => setPanel(null)}>
          <form
            className="grg-stack"
            onSubmit={(e) => {
              e.preventDefault()
              burnMut.mutate()
            }}
          >
            <div>
              <label className="grg-label" htmlFor="burn-act">
                Activity
              </label>
              <select
                id="burn-act"
                className="grg-select"
                value={burnName}
                onChange={(e) => setBurnName(e.target.value)}
              >
                {['walking', 'running', 'cycling', 'gym', 'yoga', 'hiit', 'swimming'].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="grg-label" htmlFor="burn-min">
                Minutes
              </label>
              <input
                id="burn-min"
                className="grg-input"
                value={burnMin}
                onChange={(e) => setBurnMin(e.target.value)}
              />
            </div>
            <button type="submit" className="grg-btn grg-btn--block" disabled={burnMut.isPending}>
              {burnMut.isPending ? 'Saving…' : 'Save burn'}
            </button>
          </form>
        </BoardModal>
      )}

      {panel === 'goals' && (
        <BoardModal title="Goals" onClose={() => setPanel(null)}>
          <GoalsForm
            onSaved={() => {
              setPanel(null)
              refresh()
            }}
          />
        </BoardModal>
      )}
    </GrgShell>
  )
}
