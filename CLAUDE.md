# iVelox Frontend — Claude Instructions

## Project
Private platform frontend (portfolio + Health). React + Vite + TypeScript.
Companion backend: https://github.com/nqhhdev/ivelox-core (Spring Boot)

## Git rules
- Author: nqhhdev <nqhh.dev@gmail.com> — always, no exceptions
- Never add `Co-Authored-By` in commit messages
- Never commit `.env.local`, `.agents/`, `skills-lock.json`

## Architecture
- Feature-based: `src/features/<feature>/`
- MVVM: View = components, ViewModel = custom hooks, Model = TanStack Query
- Path alias `@` = `src/`
- Shared code in `src/shared/` only — no cross-feature imports

## Stack
- React 19 + Vite + TypeScript (strict)
- TanStack Query v5 — all server state
- Zustand — JWT session only (`useAuth`)
- Tailwind CSS + shadcn/ui
- Auth: owner OTP via Spring (`/api/v1/auth/otp/*`) → JWT in localStorage
- API calls via `src/shared/api/client.ts` — always use this, never raw fetch (except public GitHub portfolio)
- No Supabase on FE

## Environment variables
All vars must be prefixed `VITE_`. Required:
- `VITE_API_URL` — Spring backend URL

## Code rules
- No business logic in components — put in hooks
- TypeScript strict mode on — no `any`, no `@ts-ignore`
- Components: functional only
- Always run `npx tsc --noEmit` before committing

## Routes
- `/` — public portfolio
- `/login` — OTP
- `/health/*` — JWT + feature flag

## Folder structure
```
src/
  app/          # Router, Providers, App.tsx
  features/     # portfolio/ health/ auth/
  shared/
    api/        # client.ts, authToken.ts
    hooks/      # useAuth.ts, usePlatformFeatures.ts
    ui/
  pages/        # thin wrappers / legacy redirects
  lib/
```
