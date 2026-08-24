# Health Board + Adaptive Day Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or implement in-session with TDD).

**Goal:** Ship board UX + adaptive meal kcal + macro day-close + daily weight + optional meal image persistence.

**Architecture:** Spring owns planning/redistribution/day-close; React board consumes enriched today API; popups for log/goals.

**Tech:** Flyway V3, JUnit for planning math, React GRG board layout.

---

### Task 1: V3 migration + AdaptivePlanning (TDD)

**Files:**
- Create `ivelox-core/.../V3__board_adaptive.sql`
- Modify `HealthPlanning.java` / new `AdaptivePlanning.java`
- Modify `BodyMath.java` (macro targets)
- Test `BodyMathTest` / `AdaptivePlanningTest`

**Steps:** Write failing tests for redistribute + macros → implement → green.

### Task 2: Repos + services + controller

**Files:** meal slot, weight, day closing, meal image repos; extend HealthProfileService / MealService / HealthController / HealthModels.

**Endpoints:** meal-slots, weights/daily, close-day, meals image create+get, enriched today.

### Task 3: FE Health board

**Files:** replace/expand `HealthDashboardPage`, drawer components, API types/hooks; slim nav; keep meal image in log popup.

### Task 4: Verify + deploy

`mvnw test`, `tsc --noEmit`, deploy core then app with correct dirs/build-args.
