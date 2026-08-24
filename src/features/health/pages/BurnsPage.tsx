import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { localISODate } from '../lib/date'
import { healthApi } from '../api/healthApi'
import { HealthNavLinks } from '../components/HealthNavLinks'

export function BurnsPage() {
  const date = localISODate()
  const toast = useToast()
  const signOut = useAuthStore((s) => s.signOut)
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['health', 'burns', date],
    queryFn: () => healthApi.listBurns(date),
  })

  const [activity, setActivity] = useState('walking')
  const [mins, setMins] = useState('30')

  const create = useMutation({
    mutationFn: () =>
      healthApi.createBurn({
        activity_name: activity,
        duration_min: Number(mins),
      }),
    onSuccess: (b) => {
      toast.success(`Logged ${Math.round(b.kcal_burned)} kcal burned`)
      void qc.invalidateQueries({ queryKey: ['health', 'burns'] })
      void qc.invalidateQueries({ queryKey: ['health', 'today'] })
    },
    onError: (e) => toast.error(e, 'Could not log burn.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => healthApi.deleteBurn(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['health', 'burns'] })
      void qc.invalidateQueries({ queryKey: ['health', 'today'] })
    },
    onError: (e) => toast.error(e, 'Could not delete.'),
  })

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health/burns" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
      narrowSm
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Burn log</h1>
      <p className="grg-lead">{date} — activity → estimated kcal burned (MET table).</p>

      <form
        className="grg-panel grg-stack"
        style={{ marginBottom: '1.5rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          create.mutate()
        }}
      >
        <div>
          <label className="grg-label" htmlFor="act">Activity</label>
          <select id="act" className="grg-select" value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="walking">Walking</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="swimming">Swimming</option>
            <option value="gym">Gym</option>
            <option value="yoga">Yoga</option>
            <option value="hiit">HIIT</option>
            <option value="football">Football</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
        <div>
          <label className="grg-label" htmlFor="mins">Duration (min)</label>
          <input id="mins" className="grg-input" value={mins} onChange={(e) => setMins(e.target.value)} />
        </div>
        <button type="submit" className="grg-btn grg-btn--block" disabled={create.isPending}>
          {create.isPending ? 'Saving…' : 'Log burn'}
        </button>
      </form>

      <div className="grg-section-head">
        <h2>Today</h2>
      </div>
      {list.isLoading ? (
        <p className="grg-hint">Loading…</p>
      ) : !list.data?.length ? (
        <div className="grg-empty">No burns logged today.</div>
      ) : (
        <div className="grg-meal-list">
          {list.data.map((b) => (
            <div key={b.id} className="grg-meal-row">
              <div className="grg-meal-row__body">
                <div className="grg-meal-row__title">{b.activity_name}</div>
                <div className="grg-meal-row__meta">
                  {b.duration_min} min · {b.source}
                </div>
              </div>
              <div className="grg-meal-row__kcal">
                <strong>{Math.round(b.kcal_burned)}</strong>
                <span>kcal</span>
              </div>
              <button
                type="button"
                className="grg-btn grg-btn--danger"
                style={{ padding: '0.4rem 0.7rem' }}
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm('Delete this burn?')) remove.mutate(b.id)
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </GrgShell>
  )
}
