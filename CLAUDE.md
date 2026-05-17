# iVelox Frontend — Claude Instructions

## Project
IELTS learning platform frontend. React + Vite + TypeScript.
Companion backend: https://github.com/nqhhdev/ivelox-core

## Git rules
- Author: nqhhdev <nqhh.dev@gmail.com> — always, no exceptions
- Never add `Co-Authored-By` in commit messages
- Never commit `.env.local`, `.agents/`, `skills-lock.json`

## Architecture
- Feature-based structure: `src/features/<skill>/` per IELTS skill
- MVVM: View = components, ViewModel = custom hooks, Model = TanStack Query
- Path alias `@` = `src/`
- Shared code in `src/shared/` only — no cross-feature imports

## Stack
- React 18 + Vite + TypeScript (strict)
- TanStack Query v5 — all server state
- Zustand — auth session only
- Tailwind CSS + shadcn/ui
- Supabase Auth (Google + Apple + Email) — auth only, no direct DB calls from FE
- API calls via `src/shared/api/client.ts` — always use this, never raw fetch
- All data fetching goes through Go backend API — never query Supabase DB directly from FE

## Environment variables
All vars must be prefixed `VITE_`. Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` — Go backend URL

## Code rules
- No business logic in components — put in hooks
- Supabase on FE = Auth only (login/logout/session) — NEVER query DB or storage from FE
- All data must go through Go backend (`VITE_API_URL`) — Supabase is BE-only for data
- No direct Supabase calls outside `src/shared/hooks/useAuth.ts`
- TypeScript strict mode on — no `any`, no `@ts-ignore`
- Components: functional only, no class components
- Always run `npx tsc --noEmit` before committing

## Folder structure
```
src/
  app/          # Router, Providers, App.tsx
  features/     # reading/ writing/ speaking/ listening/ dashboard/ tips/
  shared/
    api/        # supabase.ts, client.ts
    hooks/      # useAuth.ts, shared hooks
    ui/         # shadcn base components
  pages/        # thin route wrappers only
  lib/          # utils.ts
```

## UI reference
Design direction: Ludocode (gamified shell for serious content)
See: `docs/ui-reference-ludocode.md`
