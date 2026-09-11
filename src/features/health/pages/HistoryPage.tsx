import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { healthApi } from '../api/healthApi'
import { HealthNavLinks } from '../components/HealthNavLinks'

type Range = 'week' | 'month' | 'year'

const RANGES: { id: Range; label: string; days: number }[] = [
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: 'year', label: 'Year', days: 365 },
]

export function HistoryPage() {
  const signOut = useAuthStore((s) => s.signOut)
  const [range, setRange] = useState<Range>('week')
  const days = RANGES.find((r) => r.id === range)?.days ?? 7

  const history = useQuery({
    queryKey: ['health', 'history', days],
    queryFn: () => healthApi.weekly(days),
    placeholderData: keepPreviousData,
  })

  const d = history.data
  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? 'Week'

  return (
    <GrgShell
      light
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health/history" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
    >
      <div className="hb" style={{ paddingTop: '0.5rem' }}>
        <p className="hb-kicker">Health</p>
        <h1 style={{ margin: '0 0 0.35rem', color: 'var(--grg-title)' }}>History</h1>
        <p className="hb-muted" style={{ marginBottom: '1rem' }}>
          Totals and tips for the selected period vs your kcal target.
        </p>

        <div className="hb-actions__chips" style={{ marginBottom: '1.1rem' }} role="tablist">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={range === r.id}
              className={`hb-chip${range === r.id ? ' hb-chip--ok' : ' hb-chip--muted'}`}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {history.isError && <p className="grg-error">Could not load history.</p>}

        {d && (
          <>
            <div className="hb-card hb-card--hero">
              <p className="hb-kicker">{rangeLabel} score</p>
              <div className="hb-hero-num">
                {d.score}
                <span>/ 100</span>
              </div>
              <div className="hb-stats-4">
                <div>
                  <div className="hb-stat-big">{Math.round(d.eaten_kcal)}</div>
                  <div className="hb-muted">Eaten</div>
                </div>
                <div>
                  <div className="hb-stat-big">{Math.round(d.burned_kcal)}</div>
                  <div className="hb-muted">Burned</div>
                </div>
                <div>
                  <div className="hb-stat-big">{Math.round(d.net_kcal)}</div>
                  <div className="hb-muted">Net</div>
                </div>
                <div>
                  <div className="hb-stat-big">{Math.round(d.avg_eaten_kcal)}</div>
                  <div className="hb-muted">Avg / day</div>
                </div>
              </div>
              {d.daily_kcal_target != null && (
                <p className="hb-muted" style={{ marginTop: 12 }}>
                  Daily target: {d.daily_kcal_target} kcal · {d.days} days
                </p>
              )}
            </div>

            <div className="hb-card">
              <p className="hb-kicker">Tips</p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--grg-muted)', lineHeight: 1.5 }}>
                {d.tips.map((t) => (
                  <li key={t} style={{ marginBottom: 6 }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </GrgShell>
  )
}
