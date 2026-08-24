import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { localISODate } from '../lib/date'
import { useMeals } from '../hooks/useMeals'
import { useTodaySummary } from '../hooks/useTodaySummary'
import { TodaySummaryCard } from '../components/TodaySummaryCard'
import { MealList } from '../components/MealList'
import { MealPlanList } from '../components/MealPlanList'
import { HealthNavLinks } from '../components/HealthNavLinks'
import { Link } from 'react-router-dom'

export function HealthDashboardPage() {
  const date = localISODate()
  const toast = useToast()
  const summary = useTodaySummary(date)
  const meals = useMeals(date)
  const signOut = useAuthStore((s) => s.signOut)

  const emptySummary = { eaten_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, meal_count: 0 }

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
      narrow
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Today</h1>
      <p className="grg-lead" style={{ marginBottom: '1.25rem' }}>
        {date}
      </p>

      {summary.isError && (
        <p className="grg-error">Could not load today&apos;s summary.</p>
      )}

      <TodaySummaryCard summary={summary.data ?? emptySummary} />

      <div className="grg-section-head">
        <h2>Meal plan</h2>
        <Link to="/health/goals" className="grg-btn grg-btn--ghost">
          Edit goal
        </Link>
      </div>
      <MealPlanList slots={summary.data?.meal_plan ?? []} />

      <div className="grg-section-head">
        <h2>Logged</h2>
        <Link to="/health/log" className="grg-btn">
          + Log meal
        </Link>
      </div>

      {meals.list.isError && <p className="grg-error">Could not load meals.</p>}
      {meals.list.isLoading ? (
        <p className="grg-hint">Loading…</p>
      ) : (
        <MealList
          meals={meals.list.data ?? []}
          deletingId={meals.remove.isPending ? meals.remove.variables : null}
          onDelete={(id) => {
            if (!window.confirm('Delete this meal?')) return
            meals.remove.mutate(id, { onError: (e) => toast.error(e, 'Could not delete meal.') })
          }}
        />
      )}
    </GrgShell>
  )
}
