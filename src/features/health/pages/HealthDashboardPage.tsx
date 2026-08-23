import { Link } from 'react-router-dom'
import { LogoMark } from '@/shared/ui/LogoMark'
import { tokens } from '@/shared/ui/tokens'
import { useToast } from '@/shared/hooks/useToast'
import { localISODate } from '../lib/date'
import { useMeals } from '../hooks/useMeals'
import { useTodaySummary } from '../hooks/useTodaySummary'
import { TodaySummaryCard } from '../components/TodaySummaryCard'
import { MealList } from '../components/MealList'

export function HealthDashboardPage() {
  const date = localISODate()
  const toast = useToast()
  const summary = useTodaySummary(date)
  const meals = useMeals(date)

  const emptySummary = { eaten_kcal: 0, protein_g: 0, carb_g: 0, fat_g: 0, meal_count: 0 }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1456 0%, #0f0a1a 60%)',
      fontFamily: tokens.font,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'rgba(15,10,26,0.75)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{ display: 'flex', textDecoration: 'none' }}>
          <LogoMark width={160} />
        </Link>
        <Link
          to="/"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
          }}
        >
          ← Home
        </Link>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Health
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>
            Today's meals
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>{date}</p>
        </div>

        {summary.isError && (
          <p style={{ color: tokens.danger, fontSize: 13, marginBottom: 16 }}>Could not load today’s summary.</p>
        )}

        <TodaySummaryCard summary={summary.data ?? emptySummary} />

        <div style={{ margin: '28px 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Logged
          </h2>
          <Link
            to="/health/log"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #aa3bff, #6d28d9)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(170,59,255,0.35)',
            }}
          >
            + Log meal
          </Link>
        </div>

        {meals.list.isError && (
          <p style={{ color: tokens.danger, fontSize: 13 }}>Could not load meals.</p>
        )}
        {meals.list.isLoading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading…</p>
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
      </main>
    </div>
  )
}
