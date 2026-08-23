# Health P1 — Food Resolve + Meal Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship hybrid cache+AI food resolve, meal logging, and a today eaten summary on `/health` and `/health/log`.

**Architecture:** Go BE (`ivelox-core`) owns Postgres (`food_cache`, `meal_logs`), Gemini resolve, and JWT-protected `/api/v1/health/*`. React FE (`ivelox-app`) adds `src/features/health/` (MVVM + TanStack Query) calling `apiClient` only. Image resolve in P1 uses optional base64 in the resolve body (no Storage yet; `image_url` stays null on logs).

**Tech Stack:** Go 1.22+ · Gin · pgx/v5 · Gemini (`google/generative-ai-go`) · React 18 · Vite · TypeScript strict · TanStack Query v5 · Zod · React Hook Form

**Spec:** `docs/superpowers/specs/2026-08-23-health-kcal-tracker-design.md` (P1 only)

## Global Constraints

- FE never calls AI, Supabase DB, or Storage directly — only `VITE_API_URL` via `src/shared/api/client.ts`
- SQL only in `ivelox-core/internal/repository/postgres/`
- No `any` / `@ts-ignore` on FE; no business logic in React components
- Auth: `Authorization: Bearer <supabase-jwt>`; user id from Gin `userID`
- AI key: `GEMINI_API_KEY` on BE only
- Commits: author `nqhhdev <nqhh.dev@gmail.com>`; never commit `.env` / secrets
- Run BE tests with `go test ./...`; FE typecheck with `npx tsc --noEmit` before FE commits
- P2–P4 (body, burns, weekly AI) are **out of scope** for this plan

---

## File map

### ivelox-core (create unless noted)

| Path | Responsibility |
|------|----------------|
| `migrations/001_health_food_meals.sql` | DDL for `food_cache`, `meal_logs` |
| `internal/domain/health.go` | Domain types + repository interfaces |
| `internal/health/normalize.go` | Name normalization + portion helpers |
| `internal/health/normalize_test.go` | Normalize unit tests |
| `internal/repository/postgres/food_cache.go` | Cache CRUD |
| `internal/repository/postgres/meal_log.go` | Meal CRUD + day aggregates |
| `internal/infrastructure/gemini/nutrition.go` | Gemini text/vision JSON resolve |
| `internal/infrastructure/gemini/nutrition_test.go` | Parse/validate tests (no live API) |
| `internal/usecase/food_resolve.go` | Cache-first then AI |
| `internal/usecase/food_resolve_test.go` | Usecase tests with fakes |
| `internal/usecase/meal.go` | Create/list/delete meals + today summary |
| `internal/usecase/meal_test.go` | Meal usecase tests |
| `internal/delivery/http/health_handler.go` | HTTP handlers |
| `internal/delivery/http/health_handler_test.go` | Handler tests |
| `internal/delivery/http/router.go` | **Modify** — mount health routes |
| `cmd/server/main.go` | **Modify** — wire deps |
| `config/config.go` | Already has `GeminiAPIKey` — no change unless making it required for health |

### ivelox-app (create unless noted)

| Path | Responsibility |
|------|----------------|
| `src/features/health/types.ts` | Shared TS types matching API |
| `src/features/health/api/healthApi.ts` | Typed `apiClient` wrappers |
| `src/features/health/schemas/meal.schemas.ts` | Zod for log form |
| `src/features/health/hooks/useFoodResolve.ts` | Resolve mutation |
| `src/features/health/hooks/useMeals.ts` | Meals query + create/delete |
| `src/features/health/hooks/useTodaySummary.ts` | Today check query |
| `src/features/health/components/MealLogForm.tsx` | Text (+ optional image) form UI |
| `src/features/health/components/ResolvePreview.tsx` | Preview + qty edit |
| `src/features/health/components/TodaySummaryCard.tsx` | Eaten kcal summary |
| `src/features/health/components/MealList.tsx` | Today's meals list |
| `src/features/health/pages/HealthDashboardPage.tsx` | `/health` |
| `src/features/health/pages/MealLogPage.tsx` | `/health/log` |
| `src/app/Router.tsx` | **Modify** — add routes |
| `src/pages/Home/HomePage.tsx` | **Modify** — link/tile to Health (minimal) |

---

### Task 1: Schema migration (`food_cache`, `meal_logs`)

**Repos:** `ivelox-core`

**Files:**
- Create: `migrations/001_health_food_meals.sql`

**Interfaces:**
- Produces: tables `public.food_cache`, `public.meal_logs` ready for repositories

- [ ] **Step 1: Write migration SQL**

```sql
-- migrations/001_health_food_meals.sql
create extension if not exists "pgcrypto";

create table if not exists public.food_cache (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  aliases text[] not null default '{}',
  default_serving_qty numeric not null default 1,
  default_serving_unit text not null default 'serving'
    check (default_serving_unit in ('g', 'ml', 'serving', 'piece')),
  kcal numeric not null check (kcal >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carb_g numeric not null default 0 check (carb_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  source text not null check (source in ('ai', 'manual')),
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  updated_at timestamptz not null default now()
);

create index if not exists food_cache_updated_at_idx on public.food_cache (updated_at);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  food_cache_id uuid references public.food_cache (id) on delete set null,
  raw_input text not null default '',
  image_url text,
  quantity numeric not null check (quantity > 0),
  unit text not null check (unit in ('g', 'ml', 'serving', 'piece')),
  kcal numeric not null check (kcal >= 0),
  protein_g numeric not null default 0,
  carb_g numeric not null default 0,
  fat_g numeric not null default 0,
  meal_type text check (meal_type is null or meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meal_logs_user_logged_at_idx
  on public.meal_logs (user_id, logged_at desc);
```

- [ ] **Step 2: Apply migration**

Apply via Supabase SQL editor or Supabase MCP against the project that matches deployed `DATABASE_URL` (confirm `project_ref` first).

Verify:

```sql
select to_regclass('public.food_cache'), to_regclass('public.meal_logs');
```

Expected: both non-null.

- [ ] **Step 3: Commit (ivelox-core)**

```bash
git add migrations/001_health_food_meals.sql
git commit -m "$(cat <<'EOF'
feat(health): add food_cache and meal_logs migration

EOF
)"
```

---

### Task 2: Domain types + name normalize

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/domain/health.go`
- Create: `internal/health/normalize.go`
- Create: `internal/health/normalize_test.go`

**Interfaces:**
- Produces:
  - `domain.FoodCache`, `domain.MealLog`, `domain.FoodItem`, `domain.ResolveResult`
  - `domain.FoodCacheRepository`, `domain.MealLogRepository`
  - `health.NormalizeFoodName(s string) string`

- [ ] **Step 1: Write failing normalize tests**

```go
package health_test

import (
	"testing"

	"github.com/nqhhdev/ivelox-core/internal/health"
)

func TestNormalizeFoodName(t *testing.T) {
	cases := map[string]string{
		"  Phở Bò  ": "pho bo",
		"CƠM TẤM":    "com tam",
		"Apple Pie":  "apple pie",
	}
	for in, want := range cases {
		got := health.NormalizeFoodName(in)
		if got != want {
			t.Fatalf("NormalizeFoodName(%q)=%q want %q", in, got, want)
		}
	}
}
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
go test ./internal/health/ -run TestNormalizeFoodName -v
```

Expected: package or symbol not found.

- [ ] **Step 3: Implement domain + normalize**

`internal/domain/health.go` (essential types):

```go
package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type FoodUnit string

const (
	UnitG       FoodUnit = "g"
	UnitML      FoodUnit = "ml"
	UnitServing FoodUnit = "serving"
	UnitPiece   FoodUnit = "piece"
)

type FoodCache struct {
	ID                 uuid.UUID
	NormalizedName     string
	Aliases            []string
	DefaultServingQty  float64
	DefaultServingUnit FoodUnit
	Kcal               float64
	ProteinG           float64
	CarbG              float64
	FatG               float64
	Source             string // ai | manual
	Confidence         float64
	UpdatedAt          time.Time
}

type FoodItem struct {
	Name       string   `json:"name"`
	Quantity   float64  `json:"quantity"`
	Unit       FoodUnit `json:"unit"`
	Kcal       float64  `json:"kcal"`
	ProteinG   float64  `json:"protein_g"`
	CarbG      float64  `json:"carb_g"`
	FatG       float64  `json:"fat_g"`
	Confidence float64  `json:"confidence"`
}

type ResolveResult struct {
	Items  []FoodItem `json:"items"`
	Source string     `json:"source"` // cache | ai
	Notes  string     `json:"notes,omitempty"`
}

type MealLog struct {
	ID          uuid.UUID
	UserID      uuid.UUID
	FoodCacheID *uuid.UUID
	RawInput    string
	ImageURL    *string
	Quantity    float64
	Unit        FoodUnit
	Kcal        float64
	ProteinG    float64
	CarbG       float64
	FatG        float64
	MealType    *string
	LoggedAt    time.Time
}

type DayMealSummary struct {
	EatenKcal float64 `json:"eaten_kcal"`
	ProteinG  float64 `json:"protein_g"`
	CarbG     float64 `json:"carb_g"`
	FatG      float64 `json:"fat_g"`
	MealCount int     `json:"meal_count"`
}

type FoodCacheRepository interface {
	GetByNormalizedName(ctx context.Context, name string) (*FoodCache, error)
	UpsertFromItem(ctx context.Context, item FoodItem, source string) (*FoodCache, error)
}

type MealLogRepository interface {
	Create(ctx context.Context, m *MealLog) error
	ListByUserDate(ctx context.Context, userID uuid.UUID, day time.Time) ([]MealLog, error)
	Delete(ctx context.Context, userID, id uuid.UUID) error
	SummarizeDay(ctx context.Context, userID uuid.UUID, day time.Time) (*DayMealSummary, error)
}

type NutritionResolver interface {
	ResolveText(ctx context.Context, text string, quantity *float64, unit *FoodUnit) (*ResolveResult, error)
	ResolveImage(ctx context.Context, imageBytes []byte, mime string, hint string) (*ResolveResult, error)
}
```

`internal/health/normalize.go`: trim, lowercase, remove Vietnamese diacritics (use a small rune map or `golang.org/x/text/transform` + `unicode` norm), collapse spaces.

- [ ] **Step 4: Run tests — expect PASS**

```bash
go test ./internal/health/ -run TestNormalizeFoodName -v
```

- [ ] **Step 5: Commit**

```bash
git add internal/domain/health.go internal/health/
git commit -m "$(cat <<'EOF'
feat(health): add domain types and food name normalize

EOF
)"
```

---

### Task 3: `food_cache` repository

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/repository/postgres/food_cache.go`
- Create: `internal/repository/postgres/food_cache_test.go` (skip if no `DATABASE_URL`; or table-driven SQL string checks via integration tag)

**Interfaces:**
- Consumes: `domain.FoodCacheRepository`
- Produces: `postgres.NewFoodCacheRepository(db *pgxpool.Pool) *FoodCacheRepository`

- [ ] **Step 1: Write integration test (skip without DB)**

```go
func TestFoodCacheRepository_UpsertAndGet(t *testing.T) {
	pool := testPool(t) // helper: skip if DATABASE_URL unset
	repo := postgres.NewFoodCacheRepository(pool)
	ctx := context.Background()

	item := domain.FoodItem{
		Name: "Pho Bo", Quantity: 1, Unit: domain.UnitServing,
		Kcal: 450, ProteinG: 25, CarbG: 55, FatG: 12, Confidence: 0.9,
	}
	saved, err := repo.UpsertFromItem(ctx, item, "ai")
	if err != nil {
		t.Fatal(err)
	}
	got, err := repo.GetByNormalizedName(ctx, health.NormalizeFoodName(item.Name))
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != saved.ID || got.Kcal != 450 {
		t.Fatalf("unexpected cache row: %+v", got)
	}
}
```

- [ ] **Step 2: Implement repository**

`GetByNormalizedName`: `select ... from food_cache where normalized_name=$1`; return `pgx.ErrNoRows` wrapped as not-found sentinel or `nil, err`.

`UpsertFromItem`: normalize name via `health.NormalizeFoodName`, then:

```sql
insert into food_cache (normalized_name, default_serving_qty, default_serving_unit, kcal, protein_g, carb_g, fat_g, source, confidence, updated_at)
values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
on conflict (normalized_name) do update set
  default_serving_qty=excluded.default_serving_qty,
  default_serving_unit=excluded.default_serving_unit,
  kcal=excluded.kcal, protein_g=excluded.protein_g, carb_g=excluded.carb_g, fat_g=excluded.fat_g,
  source=excluded.source, confidence=excluded.confidence, updated_at=now()
returning ...
```

- [ ] **Step 3: Run test**

```bash
DATABASE_URL=... go test ./internal/repository/postgres/ -run TestFoodCacheRepository -v
```

- [ ] **Step 4: Commit**

```bash
git add internal/repository/postgres/food_cache.go internal/repository/postgres/food_cache_test.go
git commit -m "$(cat <<'EOF'
feat(health): add food_cache postgres repository

EOF
)"
```

---

### Task 4: `meal_logs` repository

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/repository/postgres/meal_log.go`
- Create: `internal/repository/postgres/meal_log_test.go`

**Interfaces:**
- Consumes: `domain.MealLogRepository`
- Produces: `postgres.NewMealLogRepository(db) *MealLogRepository`

- [ ] **Step 1: Write failing integration tests** for Create, ListByUserDate (UTC day bounds), Delete (only owner), SummarizeDay (sum kcal).

- [ ] **Step 2: Implement**

Day bounds: `[date 00:00:00 UTC, date+1)` using `time.Date(y,m,d,0,0,0,0,time.UTC)`.

`Delete`: `delete from meal_logs where id=$1 and user_id=$2` — if `RowsAffected()==0` return not-found.

`SummarizeDay`:

```sql
select coalesce(sum(kcal),0), coalesce(sum(protein_g),0), coalesce(sum(carb_g),0),
       coalesce(sum(fat_g),0), count(*)::int
from meal_logs
where user_id=$1 and logged_at >= $2 and logged_at < $3
```

- [ ] **Step 3: Run tests — PASS**

```bash
DATABASE_URL=... go test ./internal/repository/postgres/ -run TestMealLogRepository -v
```

- [ ] **Step 4: Commit**

```bash
git add internal/repository/postgres/meal_log.go internal/repository/postgres/meal_log_test.go
git commit -m "$(cat <<'EOF'
feat(health): add meal_logs postgres repository

EOF
)"
```

---

### Task 5: Gemini nutrition client (parse + validate)

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/infrastructure/gemini/nutrition.go`
- Create: `internal/infrastructure/gemini/nutrition_test.go`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, model `gemini-2.5-flash-lite` (same as jobfinder)
- Produces: `gemini.NewNutritionClient(ctx, apiKey) (*NutritionClient, error)` implementing `domain.NutritionResolver`
- Also export `ParseNutritionJSON(raw string) (*domain.ResolveResult, error)` for unit tests without network

- [ ] **Step 1: Write parse/validate unit tests**

```go
func TestParseNutritionJSON_Valid(t *testing.T) {
	raw := `{"items":[{"name":"com tam","quantity":1,"unit":"serving","kcal":550,"protein_g":30,"carb_g":70,"fat_g":15,"confidence":0.8}],"notes":"plate"}`
	got, err := gemini.ParseNutritionJSON(raw)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Items) != 1 || got.Items[0].Kcal != 550 {
		t.Fatalf("%+v", got)
	}
}

func TestParseNutritionJSON_RejectsNegativeKcal(t *testing.T) {
	raw := `{"items":[{"name":"x","quantity":1,"unit":"g","kcal":-1,"protein_g":0,"carb_g":0,"fat_g":0,"confidence":0.5}]}`
	if _, err := gemini.ParseNutritionJSON(raw); err == nil {
		t.Fatal("expected error")
	}
}
```

- [ ] **Step 2: Run — FAIL**

```bash
go test ./internal/infrastructure/gemini/ -run TestParseNutritionJSON -v
```

- [ ] **Step 3: Implement**

- Prompt: return **only** JSON matching resolve schema; Vietnamese dishes allowed.
- `ResolveText`: build prompt with text + optional qty/unit; `GenerateContent`; extract JSON (reuse jobfinder-style fence strip); `ParseNutritionJSON`; set `Source="ai"`.
- `ResolveImage`: `genai.ImageData{MIMEType, Data}` + hint text part.
- On invalid JSON: retry once with “fix JSON only” repair prompt; then error.
- Timeout: 30s context.

- [ ] **Step 4: Run unit tests — PASS** (no live API in CI)

```bash
go test ./internal/infrastructure/gemini/ -run TestParseNutritionJSON -v
```

- [ ] **Step 5: Commit**

```bash
git add internal/infrastructure/gemini/
git commit -m "$(cat <<'EOF'
feat(health): add Gemini nutrition resolve client

EOF
)"
```

---

### Task 6: FoodResolve usecase (cache-first hybrid)

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/usecase/food_resolve.go`
- Create: `internal/usecase/food_resolve_test.go`

**Interfaces:**
- Consumes: `FoodCacheRepository`, `NutritionResolver`
- Produces:

```go
type FoodResolveInput struct {
	Text        string
	Quantity    *float64
	Unit        *domain.FoodUnit
	ImageBytes  []byte // optional
	ImageMIME   string
}

func (uc *FoodResolveUsecase) Resolve(ctx context.Context, in FoodResolveInput) (*domain.ResolveResult, error)
```

- [ ] **Step 1: Write usecase tests with fakes**

Cases:
1. Text only + cache hit (confidence ≥ 0.6) → `source=cache`, AI **not** called
2. Cache miss → AI called → upsert cache → `source=ai`
3. Image present → skip cache lookup → AI vision → upsert each item
4. Empty text and no image → `400`-class error (`fmt.Errorf` / custom `ErrInvalidInput`)

- [ ] **Step 2: Run — FAIL**

```bash
go test ./internal/usecase/ -run TestFoodResolve -v
```

- [ ] **Step 3: Implement hybrid logic**

```text
if image present → AI ResolveImage → Upsert each → return ai
normalized := NormalizeFoodName(text)
if normalized == "" → error
cached := GetByNormalizedName
if cached != nil && cached.Confidence >= 0.6 && cache fresh (< 90 days) →
  scale kcal/macros by requested qty vs default → return cache
else → AI ResolveText → Upsert → return ai
```

Scaling: `factor = requestedQty / defaultServingQty` (if units match; if units differ, prefer AI path).

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git add internal/usecase/food_resolve.go internal/usecase/food_resolve_test.go
git commit -m "$(cat <<'EOF'
feat(health): add hybrid cache-first food resolve usecase

EOF
)"
```

---

### Task 7: Meal usecase + today summary

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/usecase/meal.go`
- Create: `internal/usecase/meal_test.go`

**Interfaces:**
- Produces:

```go
type CreateMealInput struct {
	UserID      uuid.UUID
	RawInput    string
	FoodCacheID *uuid.UUID
	Quantity    float64
	Unit        domain.FoodUnit
	Kcal        float64
	ProteinG    float64
	CarbG       float64
	FatG        float64
	MealType    *string
	LoggedAt    *time.Time // default now
}

func (uc *MealUsecase) Create(ctx context.Context, in CreateMealInput) (*domain.MealLog, error)
func (uc *MealUsecase) List(ctx context.Context, userID uuid.UUID, day time.Time) ([]domain.MealLog, error)
func (uc *MealUsecase) Delete(ctx context.Context, userID, id uuid.UUID) error
func (uc *MealUsecase) TodaySummary(ctx context.Context, userID uuid.UUID, day time.Time) (*domain.DayMealSummary, error)
```

- [ ] **Step 1: Tests** — create validates qty>0 and kcal≥0; delete wrong user fails; today summary aggregates.

- [ ] **Step 2: Implement** thin wrappers over repository + validation.

- [ ] **Step 3: `go test ./internal/usecase/ -run TestMeal -v` PASS**

- [ ] **Step 4: Commit**

```bash
git add internal/usecase/meal.go internal/usecase/meal_test.go
git commit -m "$(cat <<'EOF'
feat(health): add meal log usecase and today summary

EOF
)"
```

---

### Task 8: HTTP handlers + router + main wiring

**Repos:** `ivelox-core`

**Files:**
- Create: `internal/delivery/http/health_handler.go`
- Create: `internal/delivery/http/health_handler_test.go`
- Modify: `internal/delivery/http/router.go`
- Modify: `cmd/server/main.go`

**Interfaces:**
- Routes (all behind `middleware.Auth`):

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/v1/health/foods/resolve` | Resolve |
| POST | `/api/v1/health/meals` | CreateMeal |
| GET | `/api/v1/health/meals?date=YYYY-MM-DD` | ListMeals |
| DELETE | `/api/v1/health/meals/:id` | DeleteMeal |
| GET | `/api/v1/health/check/today?date=` | TodaySummary |

Resolve JSON body:

```json
{
  "text": "pho bo",
  "quantity": 1,
  "unit": "serving",
  "image_base64": null,
  "image_mime": null
}
```

- [ ] **Step 1: Handler tests** with fake usecases — 401 without auth already covered by middleware; test 200 resolve shape; 400 empty body; create meal 201.

- [ ] **Step 2: Implement handlers**

```go
userID, _ := uuid.Parse(c.GetString("userID"))
```

Errors: map `ErrInvalidInput` → 400; not found → 404; else 500 with `{"error":"..."}`.

- [ ] **Step 3: Update `NewRouter` signature** to accept health usecases (or a small `HealthHandler` struct). Keep auth routes unchanged.

Example mount:

```go
h := NewHealthHandler(foodUC, mealUC)
protected.POST("/health/foods/resolve", h.ResolveFood)
protected.POST("/health/meals", h.CreateMeal)
protected.GET("/health/meals", h.ListMeals)
protected.DELETE("/health/meals/:id", h.DeleteMeal)
protected.GET("/health/check/today", h.TodayCheck)
```

- [ ] **Step 4: Wire `main.go`**

```go
foodRepo := postgres.NewFoodCacheRepository(db)
mealRepo := postgres.NewMealLogRepository(db)
nutrition, err := gemini.NewNutritionClient(context.Background(), cfg.GeminiAPIKey)
// if GeminiAPIKey empty: log warning and use nil resolver only if tests need it — production should set key
foodUC := usecase.NewFoodResolveUsecase(foodRepo, nutrition)
mealUC := usecase.NewMealUsecase(mealRepo)
router := httpdelivery.NewRouter(..., authUC, foodUC, mealUC)
```

- [ ] **Step 5: Run**

```bash
go test ./internal/delivery/http/ -v
go build -o /tmp/ivelox-server ./cmd/server/
```

- [ ] **Step 6: Commit**

```bash
git add internal/delivery/http/ cmd/server/main.go
git commit -m "$(cat <<'EOF'
feat(health): expose food resolve and meal log HTTP APIs

EOF
)"
```

---

### Task 9: FE types + API client wrappers

**Repos:** `ivelox-app`

**Files:**
- Create: `src/features/health/types.ts`
- Create: `src/features/health/api/healthApi.ts`

**Interfaces:**
- Produces functions used by hooks:

```ts
export type FoodUnit = 'g' | 'ml' | 'serving' | 'piece'

export interface FoodItem {
  name: string
  quantity: number
  unit: FoodUnit
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  confidence: number
}

export interface ResolveResult {
  items: FoodItem[]
  source: 'cache' | 'ai'
  notes?: string
}

export interface MealLog {
  id: string
  raw_input: string
  quantity: number
  unit: FoodUnit
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  meal_type?: string | null
  logged_at: string
}

export interface DayMealSummary {
  eaten_kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  meal_count: number
}
```

```ts
// healthApi.ts
import { apiClient } from '@/shared/api/client'

export const healthApi = {
  resolveFood: (body: {
    text?: string
    quantity?: number
    unit?: FoodUnit
    image_base64?: string
    image_mime?: string
  }) => apiClient.post<ResolveResult>('/api/v1/health/foods/resolve', body),

  createMeal: (body: Record<string, unknown>) =>
    apiClient.post<MealLog>('/api/v1/health/meals', body),

  listMeals: (date: string) =>
    apiClient.get<MealLog[]>(`/api/v1/health/meals?date=${date}`),

  deleteMeal: (id: string) =>
    apiClient.delete<void>(`/api/v1/health/meals/${id}`),

  today: (date: string) =>
    apiClient.get<DayMealSummary>(`/api/v1/health/check/today?date=${date}`),
}
```

- [ ] **Step 1: Add files as above**

- [ ] **Step 2: `npx tsc --noEmit`** — expect PASS (or only pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add src/features/health/types.ts src/features/health/api/healthApi.ts
git commit -m "$(cat <<'EOF'
feat(health): add health API types and client wrappers

EOF
)"
```

---

### Task 10: FE schemas + hooks

**Repos:** `ivelox-app`

**Files:**
- Create: `src/features/health/schemas/meal.schemas.ts`
- Create: `src/features/health/hooks/useFoodResolve.ts`
- Create: `src/features/health/hooks/useMeals.ts`
- Create: `src/features/health/hooks/useTodaySummary.ts`

- [ ] **Step 1: Zod schema**

```ts
import { z } from 'zod'

export const mealLogFormSchema = z.object({
  text: z.string().trim().max(500).optional(),
  quantity: z.coerce.number().positive(),
  unit: z.enum(['g', 'ml', 'serving', 'piece']),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
}).refine((v) => Boolean(v.text && v.text.length > 0), {
  message: 'Enter a food name or add a photo',
  path: ['text'],
})
```

(When image selected in UI, refine is bypassed by hook logic allowing empty text.)

- [ ] **Step 2: Hooks**

```ts
// useFoodResolve.ts
export function useFoodResolve() {
  return useMutation({ mutationFn: healthApi.resolveFood })
}

// useMeals.ts
export function useMeals(date: string) {
  const qc = useQueryClient()
  const list = useQuery({
    queryKey: ['health', 'meals', date],
    queryFn: () => healthApi.listMeals(date),
  })
  const create = useMutation({
    mutationFn: healthApi.createMeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['health', 'meals', date] })
      void qc.invalidateQueries({ queryKey: ['health', 'today', date] })
    },
  })
  const remove = useMutation({
    mutationFn: healthApi.deleteMeal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['health', 'meals', date] })
      void qc.invalidateQueries({ queryKey: ['health', 'today', date] })
    },
  })
  return { list, create, remove }
}

// useTodaySummary.ts
export function useTodaySummary(date: string) {
  return useQuery({
    queryKey: ['health', 'today', date],
    queryFn: () => healthApi.today(date),
  })
}
```

- [ ] **Step 3: `npx tsc --noEmit`**

- [ ] **Step 4: Commit**

```bash
git add src/features/health/schemas src/features/health/hooks
git commit -m "$(cat <<'EOF'
feat(health): add meal form schema and query hooks

EOF
)"
```

---

### Task 11: FE pages + components + routes

**Repos:** `ivelox-app`

**Files:**
- Create components/pages listed in file map
- Modify: `src/app/Router.tsx`
- Modify: `src/pages/Home/HomePage.tsx` — add navigation entry to `/health`

**UX (P1):**
1. `/health/log` — text input, qty/unit, optional image file → Resolve → `ResolvePreview` (edit qty) → Confirm creates meal
2. `/health` — `TodaySummaryCard` + `MealList` + CTA to log

- [ ] **Step 1: Build presentational components** — no fetch inside; receive data/callbacks via props.

- [ ] **Step 2: Pages wire hooks**

Image helper in page/hook:

```ts
async function fileToBase64(file: File): Promise<{ image_base64: string; image_mime: string }> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return { image_base64: btoa(binary), image_mime: file.type || 'image/jpeg' }
}
```

- [ ] **Step 3: Router**

```tsx
<Route path="/health" element={<ProtectedRoute><HealthDashboardPage /></ProtectedRoute>} />
<Route path="/health/log" element={<ProtectedRoute><MealLogPage /></ProtectedRoute>} />
```

- [ ] **Step 4: Manual smoke** — login → `/health/log` → resolve text → confirm → see kcal on `/health`.

- [ ] **Step 5: `npx tsc --noEmit`**

- [ ] **Step 6: Commit**

```bash
git add src/features/health src/app/Router.tsx src/pages/Home/HomePage.tsx
git commit -m "$(cat <<'EOF'
feat(health): add health dashboard and meal log UI

EOF
)"
```

---

### Task 12: P1 verification checklist

**Repos:** both

- [ ] **Step 1: BE**

```bash
cd /Users/huy.nguyenquang/Documents/ivelox/ivelox-core
go test ./internal/health/ ./internal/usecase/ ./internal/infrastructure/gemini/ ./internal/delivery/http/ -count=1
```

- [ ] **Step 2: FE**

```bash
cd /Users/huy.nguyenquang/Documents/ivelox/ivelox-app
npx tsc --noEmit
```

- [ ] **Step 3: End-to-end manual**

1. Cache miss path: new food name → `source: ai` → second resolve same name → `source: cache`
2. Meal appears in list and today `eaten_kcal` updates
3. Delete meal updates summary
4. Resolve with image (optional) returns items without crashing

- [ ] **Step 4: Note follow-ups (not in P1)** — Supabase Storage for `image_url`; body/goals/burns/weekly (P2–P4 plans)

---

## Spec coverage (self-review)

| Spec P1 item | Task |
|--------------|------|
| Hybrid cache + AI resolve | 5, 6 |
| `food_cache` / `meal_logs` | 1, 3, 4 |
| Resolve + meals + today APIs | 7, 8 |
| FE `/health`, `/health/log` | 9–11 |
| Text + image input | 6, 8, 11 (base64; no Storage) |
| AI JSON contract + validation | 5 |
| Auth via JWT / apiClient | 8, 9 |
| P2–P4 | Explicitly deferred |

**Intentionally deferred from full spec:** burns, body metrics, goals, weekly AI tip/score, Supabase Storage persistence of images, health_snapshots.
