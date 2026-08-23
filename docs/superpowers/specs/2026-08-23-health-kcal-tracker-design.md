# Health / Kcal Tracker Design Spec

**Date:** 2026-08-23  
**Status:** Draft — pending user review  
**Author:** nqhhdev  
**Repos:** `ivelox-app` (FE) + `ivelox-core` (BE)  
**Approach:** Hybrid cache + AI (Approach 2)

---

## 1. Overview

Add a **Health** feature to iVelox so users can log food (text and/or photo + quantity), track calories eaten and burned, record body metrics (BMI), set weight/kcal goals, and see a health-check dashboard (today summary, AI tip/score, weekly trends).

**Non-goals (post-MVP):**
- Apple Health / Google Fit sync
- Barcode scanning
- Social sharing

**Constraints (existing iVelox rules):**
- FE never calls AI, Supabase DB, or Storage directly
- All data via Go BE (`VITE_API_URL`)
- Supabase on FE = Auth only
- AI API keys only on BE
- Feature isolation: `src/features/health/` — no cross-feature imports

---

## 2. Architecture

```
FE (ivelox-app)                         BE (ivelox-core)                      External
─────────────────                       ────────────────                      ────────
src/features/health/                    /api/v1/health/*
  components / hooks / pages              FoodResolveService  ──► Gemini (text/vision)
  TanStack Query → apiClient              FoodCache (Postgres)
                                          MealLog / BurnLog
                                          BodyMetrics / Goals
                                          HealthCheckService ──► Gemini (tips/weekly)
```

**Food resolve flow (hybrid):**
1. User submits text + quantity and/or image (optional text hint)
2. BE normalizes text (lowercase, strip diacritics, parse portion)
3. **Cache hit** with acceptable confidence → return immediately (`source: cache`)
4. **Miss / image / low confidence** → AI with strict JSON schema → validate → upsert `food_cache` → return (`source: ai`)
5. FE shows preview; user may edit quantity; confirm → `POST /meals`

**DB access:** BE uses `pgx` + `DATABASE_URL` (Supabase Postgres). Schema changes via SQL migrations / Supabase MCP on project `zvcpgyzwmwwmredwzgcy` (confirm env before applying). MCP is for agent/ops only — runtime never uses MCP.

---

## 3. Data model

All tables in Supabase `public` schema unless noted. RLS: deny direct client access; BE uses service/pooler connection.

### `food_cache`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `normalized_name` | text unique | lookup key |
| `aliases` | text[] | optional alternate names |
| `default_serving_qty` | numeric | |
| `default_serving_unit` | text | `g` \| `ml` \| `serving` \| `piece` |
| `kcal` | numeric | per default serving |
| `protein_g` / `carb_g` / `fat_g` | numeric | |
| `source` | text | `ai` \| `manual` |
| `confidence` | numeric | 0–1 |
| `updated_at` | timestamptz | lazy refresh TTL 30–90 days |

### `meal_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `food_cache_id` | uuid nullable FK | |
| `raw_input` | text | original user text |
| `image_url` | text nullable | BE-managed storage URL |
| `quantity` / `unit` | numeric / text | |
| `kcal`, macros | numeric | snapshot at log time |
| `meal_type` | text nullable | breakfast/lunch/dinner/snack |
| `logged_at` | timestamptz | |

### `burn_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | |
| `activity_name` | text | |
| `duration_min` | int | |
| `kcal_burned` | numeric | |
| `source` | text | `manual` \| `met_table` \| `ai` |
| `logged_at` | timestamptz | |

### `body_metrics`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid | |
| `height_cm` | numeric | |
| `weight_kg` | numeric | |
| `bmi` | numeric | computed on write |
| `recorded_at` | timestamptz | |

### `health_goals`
| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid PK | one row per user |
| `target_weight_kg` | numeric nullable | |
| `daily_kcal_target` | int nullable | |
| `daily_burn_target` | int nullable | |
| `start_at` / `target_at` | date nullable | |
| `updated_at` | timestamptz | |

### `health_snapshots` (optional performance cache)
| Column | Type | Notes |
|--------|------|-------|
| `user_id` + `day` | composite PK | |
| `eaten_kcal` / `burned_kcal` / `net_kcal` | numeric | |
| `ai_score` | int nullable | 0–100 |
| `ai_tips` | jsonb nullable | |
| `computed_at` | timestamptz | weekly AI tip ≤ 1 call/user/day |

---

## 4. API (ivelox-core)

Base: `/api/v1/health`. All authenticated with `Authorization: Bearer <supabase-jwt>`.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/foods/resolve` | text and/or image → estimate (no log) |
| POST | `/meals` | confirm meal log |
| GET | `/meals?date=` | list meals for day |
| DELETE | `/meals/:id` | delete own meal |
| POST | `/burns` | log burn |
| GET | `/burns?date=` | list burns |
| DELETE | `/burns/:id` | delete own burn |
| POST | `/body-metrics` | record height/weight |
| GET | `/body-metrics/latest` | latest metrics + BMI |
| GET | `/body-metrics?from&to` | history |
| PUT | `/goals` | upsert goals |
| GET | `/goals` | current goals |
| GET | `/check/today` | eaten/burned/net/remaining/BMI/progress + short tip if cached |
| GET | `/check/weekly` | 7–30 day trends + AI score/tips |

### `POST /foods/resolve` response
```json
{
  "items": [
    {
      "name": "pho bo",
      "quantity": 1,
      "unit": "serving",
      "kcal": 450,
      "protein_g": 25,
      "carb_g": 55,
      "fat_g": 12,
      "confidence": 0.82
    }
  ],
  "source": "cache",
  "notes": "assumed medium bowl ~450g"
}
```

`source`: `cache` | `ai`. Image upload: multipart or signed upload via BE — FE never talks to Supabase Storage.

---

## 5. AI contracts

### Food resolve (text / vision)
Strict JSON only (schema in §4 response `items`). BE validates:
- required fields present
- kcal ≥ 0, macros ≥ 0
- confidence in 0–1

On validation failure: one retry; then user-facing error.

### Burn estimate
Prefer static MET table for common activities. Unknown activity → AI once → optionally cache activity→MET mapping.

### Health-check weekly
BE aggregates numbers from DB first. AI receives only those aggregates and returns:
- `score` 0–100
- `tips` (2–3 short strings)

AI must not invent calorie totals. Result cached in `health_snapshots` (max 1 AI call per user per day for weekly tip).

### Provider
Gemini (already used in `ivelox-core` jobfinder). Key: `GEMINI_API_KEY` on BE only.

---

## 6. Error handling

| Case | Behavior |
|------|----------|
| AI timeout / key down | Return cache if usable; else 503 with clear message |
| Ambiguous / non-food image | Low confidence + ask for text confirmation |
| Rate limit | 429 + `Retry-After` |
| Missing goals/body | Dashboard still works; CTA to setup |
| Unauthorized meal/burn delete | 403/404 |

---

## 7. Frontend (`ivelox-app`)

### Structure
```
src/features/health/
  components/     # dashboard widgets, meal form, burn form, charts
  pages/          # thin route wrappers
  hooks/          # ViewModels (TanStack Query mutations/queries)
  api/            # typed calls via shared apiClient
  schemas/        # Zod
```

### Routes
| Path | Screen |
|------|--------|
| `/health` | Today dashboard |
| `/health/log` | Resolve + log meal |
| `/health/burns` | Log activity burn |
| `/health/body` | Body metrics + BMI |
| `/health/goals` | Weight / kcal targets |
| `/health/weekly` | Trends + AI score/tips |

### UX flows
1. **Meal:** input → resolve → preview/edit qty → confirm → refresh today  
2. **Burn:** activity + minutes → estimate → confirm  
3. **Body:** height/weight → BMI → save  
4. **Goals:** targets → drive remaining kcal on dashboard  
5. **Dashboard:** eaten / burned / net / remaining / BMI / tip; link to weekly  

UI follows existing Ludocode / iVelox shell patterns (not a greenfield visual system).

---

## 8. Phased delivery

| Phase | Deliverable | BE | FE |
|-------|-------------|----|----|
| **P1** | Hybrid food resolve + meal log + today eaten summary | `food_cache`, meals APIs, AI resolve | `/health`, `/health/log` |
| **P2** | Body metrics + goals | metrics + goals APIs | `/body`, `/goals` |
| **P3** | Manual burn log | burns APIs (+ MET/AI estimate) | `/burns` |
| **P4** | Full health-check | `/check/today`, `/check/weekly`, snapshots + AI tips | dashboard enrich + `/weekly` |

Implementation order is strict: P1 → P2 → P3 → P4.

---

## 9. Testing

**BE**
- Unit: normalize food name, BMI calc, MET lookup, JSON schema validation
- Integration: resolve cache hit/miss, meal CRUD authz, weekly aggregate without AI inventing numbers
- AI client: mocked responses + invalid JSON path

**FE**
- Hook tests for resolve → confirm flow
- Form validation (Zod)
- Dashboard empty states (no goals / no logs)

---

## 10. Open confirmations before P1 impl

1. Supabase MCP `project_ref=zvcpgyzwmwwmredwzgcy` matches the `DATABASE_URL` used by deployed `ivelox-core` (CI historically referenced another ref).
2. Image storage: Supabase Storage via BE service role vs Fly volume — default **Supabase Storage via BE**.
3. Spec lives in `ivelox-app`; BE work tracked in `ivelox-core` plan after this approval.
