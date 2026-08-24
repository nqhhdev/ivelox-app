import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { healthApi } from '../api/healthApi'
import { HealthNavLinks } from '../components/HealthNavLinks'

export function BodyMetricsPage() {
  const toast = useToast()
  const signOut = useAuthStore((s) => s.signOut)
  const qc = useQueryClient()
  const latest = useQuery({
    queryKey: ['health', 'body', 'latest'],
    queryFn: () => healthApi.latestBody(),
    retry: false,
  })

  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('70')

  const save = useMutation({
    mutationFn: () =>
      healthApi.createBody({
        height_cm: Number(height),
        weight_kg: Number(weight),
      }),
    onSuccess: (data) => {
      toast.success(`BMI ${data.bmi} (${data.bmi_category})`)
      void qc.invalidateQueries({ queryKey: ['health', 'body'] })
      void qc.invalidateQueries({ queryKey: ['health', 'today'] })
    },
    onError: (e) => toast.error(e, 'Could not save body metrics.'),
  })

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health/body" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
      narrowSm
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Body metrics</h1>
      <p className="grg-lead">Height + weight → BMI. Used for goal planning.</p>

      {latest.data && (
        <div className="grg-panel" style={{ marginBottom: '1.25rem' }}>
          <p className="grg-eyebrow">Latest</p>
          <div className="grg-stat-grid">
            <div>
              <div className="grg-stat-value">{latest.data.height_cm} cm</div>
              <div className="grg-stat-label">Height</div>
            </div>
            <div>
              <div className="grg-stat-value">{latest.data.weight_kg} kg</div>
              <div className="grg-stat-label">Weight</div>
            </div>
            <div>
              <div className="grg-stat-value">{latest.data.bmi}</div>
              <div className="grg-stat-label">BMI</div>
            </div>
            <div>
              <div className="grg-stat-value">{latest.data.bmi_category}</div>
              <div className="grg-stat-label">Category</div>
            </div>
          </div>
        </div>
      )}

      <form
        className="grg-panel grg-stack"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <div className="grg-grid-2">
          <div>
            <label className="grg-label" htmlFor="h">
              Height (cm)
            </label>
            <input
              id="h"
              className="grg-input"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div>
            <label className="grg-label" htmlFor="w">
              Weight (kg)
            </label>
            <input
              id="w"
              className="grg-input"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="grg-btn grg-btn--block" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save metrics'}
        </button>
      </form>
    </GrgShell>
  )
}
