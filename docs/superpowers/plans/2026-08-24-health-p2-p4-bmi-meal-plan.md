# Health P2–P4 + BMI Goal Meal Plan

**Goal:** Ship body metrics, goals (BMI-based weight % → daily kcal + day meal plan), burn logs, and enriched today/weekly health-check.

**Repos:** `ivelox-core` (Spring) + `ivelox-app` (React)  
**Order:** migration → BE services/APIs → FE pages → deploy

## BMI goal flow (new)

1. User records height/weight (body metrics) → BMI  
2. User sets goal e.g. reduce **10%** weight + weeks + sex/age/activity  
3. BE computes: `target_weight`, safe daily deficit, `daily_kcal_target` (Mifflin–St Jeor × activity − deficit)  
4. BE builds **day meal plan** slots (breakfast/lunch/dinner/snack % of kcal + VN food suggestions)  
5. Dashboard shows eaten / burned / net / remaining vs target + today’s meal plan

## APIs

| Method | Path |
|--------|------|
| POST | `/body-metrics` |
| GET | `/body-metrics/latest` |
| GET | `/body-metrics?from&to` |
| PUT | `/goals` (upsert + recompute plan) |
| GET | `/goals` |
| GET | `/goals/meal-plan` (today’s plan from stored goal) |
| POST | `/burns` |
| GET | `/burns?date=` |
| DELETE | `/burns/:id` |
| GET | `/check/today?date=` (enriched) |
| GET | `/check/weekly?days=7` |

## Tables (Flyway V2)

`body_metrics`, `burn_logs`, `health_goals`, `health_snapshots` (optional tip cache)

## FE routes

`/health/body`, `/health/goals`, `/health/burns`, `/health/weekly` + dashboard enrich
