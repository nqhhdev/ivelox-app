# P3 — FE portfolio + OTP login + Health gate

**Goal:** Public portfolio at `/`, owner OTP login at `/login`, JWT-gated `/health/*` with feature flag.

## Checklist

- [x] JWT auth store (replace Supabase session)
- [x] `apiClient` Bearer JWT + 401 → `/login`
- [x] OTP login page (request + verify)
- [x] Portfolio `/` (GitHub + content overrides)
- [x] Router: public `/`, protected `/health`, redirect legacy auth/onboarding
- [x] Feature flag gate for Health
- [x] Update CLAUDE.md / env docs; `tsc -b`
