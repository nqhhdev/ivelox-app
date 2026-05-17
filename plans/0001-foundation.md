# Phase 0 — Foundation ✅

## Goal
Project scaffold, auth flow, routing, and shared API client.

## Completed
- [x] Vite + React 18 + TypeScript strict
- [x] Tailwind CSS v3
- [x] shadcn/ui (Button component)
- [x] Path alias `@` → `src/`
- [x] React Router v6 with ProtectedRoute
- [x] Supabase Auth: Email + Google + Apple OAuth
- [x] Zustand auth store (`useAuth`)
- [x] TanStack Query v5 (`QueryClientProvider`)
- [x] Typed API client (`src/shared/api/client.ts`) — attaches JWT Bearer token
- [x] `LoginPage`, `CallbackPage`, `HomePage`
- [x] `CLAUDE.md` + `.claude/architecture.md`
- [x] `docs/ui-reference-ludocode.md`

## Key Files
```
src/app/App.tsx
src/app/Router.tsx
src/app/providers.tsx
src/shared/api/supabase.ts
src/shared/api/client.ts
src/shared/hooks/useAuth.ts
src/pages/Auth/LoginPage.tsx
src/pages/Auth/CallbackPage.tsx
src/pages/Home/HomePage.tsx
```
