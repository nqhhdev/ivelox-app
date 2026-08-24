import { useQuery } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { healthApi } from '../api/healthApi'
import { HealthNavLinks } from '../components/HealthNavLinks'

export function WeeklyPage() {
  const signOut = useAuthStore((s) => s.signOut)
  const weekly = useQuery({
    queryKey: ['health', 'weekly', 7],
    queryFn: () => healthApi.weekly(7),
  })

  const d = weekly.data

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health/weekly" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Weekly check</h1>
      <p className="grg-lead">7-day totals, score, and tips vs your kcal target.</p>

      {weekly.isLoading && <p className="grg-hint">Loading…</p>}
      {weekly.isError && <p className="grg-error">Could not load weekly check.</p>}

      {d && (
        <>
          <div className="grg-panel" style={{ marginBottom: '1.25rem' }}>
            <p className="grg-eyebrow">Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <span className="grg-kcal">{d.score}</span>
              <span className="grg-hint" style={{ margin: 0 }}>
                / 100
              </span>
            </div>
            <div className="grg-stat-grid">
              <div>
                <div className="grg-stat-value">{Math.round(d.eaten_kcal)}</div>
                <div className="grg-stat-label">Eaten</div>
              </div>
              <div>
                <div className="grg-stat-value">{Math.round(d.burned_kcal)}</div>
                <div className="grg-stat-label">Burned</div>
              </div>
              <div>
                <div className="grg-stat-value">{Math.round(d.net_kcal)}</div>
                <div className="grg-stat-label">Net</div>
              </div>
              <div>
                <div className="grg-stat-value">{Math.round(d.avg_eaten_kcal)}</div>
                <div className="grg-stat-label">Avg/day</div>
              </div>
            </div>
            {d.daily_kcal_target != null && (
              <p className="grg-hint" style={{ marginTop: 12 }}>
                Daily target: {d.daily_kcal_target} kcal
              </p>
            )}
          </div>

          <div className="grg-section-head">
            <h2>Tips</h2>
          </div>
          <ul className="grg-meal-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {d.tips.map((t) => (
              <li key={t} className="grg-panel" style={{ marginBottom: 8 }}>
                {t}
              </li>
            ))}
          </ul>
        </>
      )}
    </GrgShell>
  )
}
