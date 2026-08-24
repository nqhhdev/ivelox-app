# Health Board + Adaptive Day Design

**Date:** 2026-08-24  
**Status:** Approved  
**Author:** nqhhdev  
**Repos:** `ivelox-app` + `ivelox-core`  
**Approach:** BE-owned adaptive plan + day close (Approach 2)

## Goals

1. Single **Health board** (`/health`): stats/meals left, body/BMI/weight right; actions in popups.
2. **Adaptive meal targets**: under-eating (or skip) earlier meals redistributes kcal to later slots (time windows ICT + manual done/skip).
3. **End-of-day report**: kcal + protein/carb/fat gaps + short supplement tips (rule-based).
4. **Daily weight** log on the board.
5. **Optional food image** on resolve/create — persist on BE (names alone are weak).

## Non-goals (this pass)

- Micronutrients, barcode, wearables
- Multi-user coaching AI on every log
- Separate S3 (store image bytes in Postgres for owner app)

## UX

Desktop: two columns. Mobile: body panel collapses above/below stats.  
Popups: Log meal (text + optional image), Log burn, Goals, Close day / deficit detail.  
Deep routes may redirect into board + open popup.

## Adaptive algorithm

- Base: even split of `daily_kcal` across selected `meal_types`.
- Slot **closed** when: status `done`/`skipped`, OR ICT clock past meal window:
  - breakfast → 10:30, lunch → 14:30, dinner → 20:30, snack → 23:00
- `closed_deficit` = Σ max(0, base_kcal − eaten_kcal_in_slot) for closed slots (`skipped` → eaten=0).
- Open slots share `Σ base_open + closed_deficit` evenly (remainder on last).
- Floor: open slot ≥ 10% of its base (avoid zeroing).

## Macro targets

Derived when saving goal (stored on `health_goals`):

- protein_g ≈ clamp(1.8 × weight_kg, 60, 220)
- fat_g ≈ clamp(0.8 × weight_kg, 40, 120)
- carb_g ≈ max(0, (daily_kcal − protein×4 − fat×9) / 4)

## Day close

Snapshot `day_closings`: eaten/burned/net, macro targets vs actual, `tips_json`.  
Auto-eligible after last selected meal window; also manual “Close day”.

## Data (V3)

- `health_goals`: + protein/carb/fat targets, `meal_types_json`
- `meal_slot_states`: user_id, day, meal_type, status, base_kcal, adjusted_kcal
- `daily_weight_logs`: user_id, day, weight_kg (unique day)
- `meal_images`: meal_log_id, mime, bytes (optional image persistence)
- reuse/extend `health_snapshots` or prefer `day_closings` for macro gaps

## API (additions)

- `GET /check/today` — enriched: adaptive `meal_plan`, macros progress, weight today, open/closed slots
- `PUT /meal-slots` — set done/skipped for a meal_type on a day
- `POST /weights/daily` — upsert today’s weight
- `POST /meals` — optional `image_base64`/`image_mime` persisted
- `GET /meals/{id}/image` — serve stored image
- `POST /check/close-day` — compute & store day closing / deficit tips

## Image

Optional on resolve (existing) and on meal create. Persist when provided; serve via authenticated GET.
