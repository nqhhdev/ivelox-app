# 3D Health Body Atlas Design

**Date:** 2026-08-24  
**Status:** Approved  
**Approach:** Hybrid glTF + procedural layers; BE condition catalog (Approach 2)

## Pass 1 (this ship)

- Right panel on `/health`: Three.js body (glTF low-poly or procedural fallback)
- Layers: Fat / Vessels / Bone (toggle)
- Hover regions → metrics (BMI, eBF%, kcal left, protein) + education tip + citations
- `GET /api/v1/health/body/atlas` — static atlas JSON (regions, tips, citations)
- Disclaimer: educational, not diagnosis
- Fallback: existing BMI ring if WebGL unavailable

## Roadmap (schema seeds only if cheap)

- `health_conditions`, `condition_food_rules` — deferred UI; document in atlas `future_conditions`

## Medical framing (estimates)

- BMI categories: WHO adult cutoffs
- Body fat %: US Navy heuristic when waist/neck unavailable → show as rough band from BMI (Deurenberg-style) with citation
- Education blurbs: AHA (activity/vascular), IOF/WHO bone health framing — never diagnose

## FE

- `src/features/health/components/Body3DPanel.tsx` + `body3d/*`
- three + @react-three/fiber + drei
- Lazy-load so board stays fast
