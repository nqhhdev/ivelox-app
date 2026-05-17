# iVelox Frontend — Architecture & Structure

## Overview
Web-only React SPA for IELTS learning. Auth via Supabase, all data via Go backend API.
Mobile app planned separately in a future `ivelox-mobile` repo (React Native).

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript (strict) |
| Routing | React Router v6 (SPA) |
| Server state | TanStack Query v5 |
| Client state | Zustand (auth session only) |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Auth | Supabase Auth (Email + Google + Apple OAuth) |
| API | REST → Go backend (`VITE_API_URL`) |

## Architecture Pattern: Feature-based MVVM

```
View       = React components (render only, no logic)
ViewModel  = Custom hooks (useExam, usePractice, useAuth...)
Model      = TanStack Query (server state) + Supabase session
```

**Rule:** Components never fetch data directly. All data lives in hooks.

## Folder Structure

```
ivelox-app/
├── public/                   # static assets
├── src/
│   ├── main.tsx              # React entry point
│   ├── index.css             # Tailwind directives + global styles
│   │
│   ├── app/                  # App bootstrap (NOT a feature)
│   │   ├── App.tsx           # Root component — wraps Providers + Router
│   │   ├── Router.tsx        # All routes defined here, ProtectedRoute
│   │   └── providers.tsx     # QueryClientProvider + AuthBootstrap
│   │
│   ├── features/             # One folder per IELTS skill (add as built)
│   │   ├── reading/
│   │   │   ├── components/   # TranslatablePassage, MCQQuestion...
│   │   │   └── hooks/        # useReading, useTranslation
│   │   ├── writing/
│   │   │   ├── components/   # WritingEditor, FeedbackPanel...
│   │   │   └── hooks/        # useWriting, useAIFeedback
│   │   ├── speaking/
│   │   │   ├── components/   # SpeakingRecorder, TranscriptView...
│   │   │   └── hooks/        # useSpeaking, useRecorder
│   │   ├── listening/
│   │   │   ├── components/   # AudioPlayer, ListeningQuestion...
│   │   │   └── hooks/        # useListening
│   │   ├── dashboard/
│   │   │   ├── components/   # BandChart, ProgressHeatmap, RecommendCard
│   │   │   └── hooks/        # useDashboard, useRecommendations
│   │   └── tips/
│   │       ├── components/   # TipCard, TipFilter
│   │       └── hooks/        # useTips
│   │
│   ├── shared/               # Cross-feature shared code ONLY
│   │   ├── api/
│   │   │   ├── supabase.ts   # Supabase client (auth only — NO DB queries)
│   │   │   └── client.ts     # Typed REST client — attaches JWT to every request
│   │   ├── hooks/
│   │   │   └── useAuth.ts    # Zustand auth store + useAuthListener
│   │   └── ui/               # shadcn base components (auto-generated)
│   │
│   ├── pages/                # Thin route wrappers — compose features, no logic
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── CallbackPage.tsx
│   │   ├── Home/
│   │   │   └── HomePage.tsx
│   │   ├── Exam/             # (to be built)
│   │   ├── Practice/         # (to be built)
│   │   ├── Dashboard/        # (to be built)
│   │   └── Tips/             # (to be built)
│   │
│   ├── components/
│   │   └── ui/               # shadcn/ui generated components
│   │
│   └── lib/
│       └── utils.ts          # cn() helper for Tailwind class merging
│
├── docs/                     # Project documentation
├── .claude/                  # Claude agent context (this folder)
├── CLAUDE.md                 # Claude rules (git, code, architecture)
├── components.json           # shadcn/ui config
├── tailwind.config.ts
├── vite.config.ts            # path alias: @ → src/
└── tsconfig.app.json         # baseUrl + paths for @ alias
```

## Key Rules

### Supabase = Auth only on FE
```
✅ supabase.auth.signInWithOAuth(...)
✅ supabase.auth.getSession()
✅ supabase.auth.onAuthStateChange(...)
❌ supabase.from('profiles').select(...)   ← NEVER — use Go API
❌ supabase.storage.from('audio').upload() ← NEVER — use Go API
```

### Data flow
```
Component → Hook → apiClient.get/post() → Go Backend → Supabase DB
```
Never skip the Go backend layer.

### Import rules
```
✅ features/reading/ imports from shared/
✅ pages/ imports from features/ and shared/
❌ features/reading/ imports from features/writing/  ← cross-feature forbidden
❌ shared/ imports from features/                    ← forbidden
```

### Path alias
`@` maps to `src/`. Always use `@/` imports, never relative `../../`.

## Auth Flow
```
1. User opens app → ProtectedRoute checks useAuthStore
2. No session → redirect to /login
3. Login (email/Google/Apple) → Supabase issues JWT
4. useAuthListener stores session in Zustand
5. Every API call → client.ts attaches JWT as Bearer token
6. Go backend verifies JWT → returns data
```

## Environment Variables
```env
VITE_SUPABASE_URL=         # Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Supabase anon/publishable key
VITE_API_URL=              # Go backend URL (localhost:8080 or prod)
```

## Current State (Foundation complete)
- [x] Vite + React + TypeScript + Tailwind
- [x] shadcn/ui with Button
- [x] Supabase auth (Email + Google + Apple)
- [x] Protected routes
- [x] Typed API client with JWT injection
- [ ] features/reading
- [ ] features/writing
- [ ] features/speaking
- [ ] features/listening
- [ ] features/dashboard
- [ ] features/tips
