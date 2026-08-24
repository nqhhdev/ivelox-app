import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GrgShell } from '@/shared/ui/GrgShell'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useToast } from '@/shared/hooks/useToast'
import { healthApi } from '../api/healthApi'
import { HealthNavLinks } from '../components/HealthNavLinks'
import { MealPlanList } from '../components/MealPlanList'

export function GoalsPage() {
  const toast = useToast()
  const signOut = useAuthStore((s) => s.signOut)
  const qc = useQueryClient()

  const goal = useQuery({
    queryKey: ['health', 'goals'],
    queryFn: () => healthApi.getGoal(),
    retry: false,
  })
  const body = useQuery({
    queryKey: ['health', 'body', 'latest'],
    queryFn: () => healthApi.latestBody(),
    retry: false,
  })

  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('70')
  const [sex, setSex] = useState('male')
  const [age, setAge] = useState('30')
  const [activity, setActivity] = useState('moderate')
  const [changePct, setChangePct] = useState('-10')
  const [weeks, setWeeks] = useState('12')

  useEffect(() => {
    if (body.data) {
      setHeight(String(body.data.height_cm))
      setWeight(String(body.data.weight_kg))
    }
  }, [body.data])

  useEffect(() => {
    if (goal.data) {
      if (goal.data.height_cm != null) setHeight(String(goal.data.height_cm))
      if (goal.data.weight_kg != null) setWeight(String(goal.data.weight_kg))
      if (goal.data.sex) setSex(goal.data.sex)
      if (goal.data.age_years != null) setAge(String(goal.data.age_years))
      if (goal.data.activity_level) setActivity(goal.data.activity_level)
      if (goal.data.weight_change_pct != null) setChangePct(String(goal.data.weight_change_pct))
      if (goal.data.weeks != null) setWeeks(String(goal.data.weeks))
    }
  }, [goal.data])

  const save = useMutation({
    mutationFn: () =>
      healthApi.upsertGoal({
        height_cm: Number(height),
        weight_kg: Number(weight),
        sex,
        age_years: Number(age),
        activity_level: activity,
        weight_change_pct: Number(changePct),
        weeks: Number(weeks),
      }),
    onSuccess: (data) => {
      toast.success(`Target ${data.daily_kcal_target} kcal/day`)
      void qc.invalidateQueries({ queryKey: ['health'] })
    },
    onError: (e) => toast.error(e, 'Could not save goal.'),
  })

  const plan = goal.data?.meal_plan ?? save.data?.meal_plan ?? []

  return (
    <GrgShell
      brand="iVelox"
      nav={
        <>
          <HealthNavLinks active="/health/goals" />
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </>
      }
      narrow
    >
      <p className="grg-eyebrow">Health</p>
      <h1>Goals & meal plan</h1>
      <p className="grg-lead">
        Example: reduce 10% weight — we compute BMI, target weight, daily kcal, and a full-day meal plan.
      </p>

      {(goal.data || save.data) && (
        <div className="grg-panel" style={{ marginBottom: '1.25rem' }}>
          <p className="grg-eyebrow">Computed</p>
          <div className="grg-stat-grid">
            <div>
              <div className="grg-stat-value">{(goal.data ?? save.data)?.bmi}</div>
              <div className="grg-stat-label">BMI</div>
            </div>
            <div>
              <div className="grg-stat-value">{(goal.data ?? save.data)?.target_weight_kg} kg</div>
              <div className="grg-stat-label">Target wt</div>
            </div>
            <div>
              <div className="grg-stat-value">{(goal.data ?? save.data)?.daily_kcal_target}</div>
              <div className="grg-stat-label">Kcal/day</div>
            </div>
            <div>
              <div className="grg-stat-value">{(goal.data ?? save.data)?.kg_to_change} kg</div>
              <div className="grg-stat-label">Δ weight</div>
            </div>
          </div>
        </div>
      )}

      <form
        className="grg-panel grg-stack"
        style={{ marginBottom: '1.5rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <div className="grg-grid-2">
          <div>
            <label className="grg-label" htmlFor="gh">Height (cm)</label>
            <input id="gh" className="grg-input" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div>
            <label className="grg-label" htmlFor="gw">Weight (kg)</label>
            <input id="gw" className="grg-input" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>
        <div className="grg-grid-2">
          <div>
            <label className="grg-label" htmlFor="sex">Sex</label>
            <select id="sex" className="grg-select" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="grg-label" htmlFor="age">Age</label>
            <input id="age" className="grg-input" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="grg-label" htmlFor="act">Activity</label>
          <select id="act" className="grg-select" value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very active</option>
          </select>
        </div>
        <div className="grg-grid-2">
          <div>
            <label className="grg-label" htmlFor="pct">Weight change %</label>
            <input
              id="pct"
              className="grg-input"
              value={changePct}
              onChange={(e) => setChangePct(e.target.value)}
              placeholder="-10"
            />
            <p className="grg-hint">Use -10 to cut 10% body weight</p>
          </div>
          <div>
            <label className="grg-label" htmlFor="weeks">Weeks</label>
            <input id="weeks" className="grg-input" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="grg-btn grg-btn--block" disabled={save.isPending}>
          {save.isPending ? 'Calculating…' : 'Calculate plan'}
        </button>
      </form>

      <div className="grg-section-head">
        <h2>Day meal plan</h2>
      </div>
      <MealPlanList slots={plan} />
    </GrgShell>
  )
}
