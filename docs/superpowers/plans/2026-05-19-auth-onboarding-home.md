# Auth, Onboarding & Home Dashboard — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Full auth flow (login, register, verify email, forgot password), 4-step onboarding, and home dashboard — all with dark aurora UI, i18n (EN/VI), and Supabase Auth.

**Architecture:** Feature-based MVVM — Views in `src/features/<feature>/pages` and `components/`, ViewModels in `hooks/`, shared state via Zustand. All auth via Supabase SDK session only; data via Go backend API.

**Tech Stack:** React 18 · Vite · TypeScript strict · React Hook Form + Zod v4 · Zustand v5 persist · Supabase Auth SDK · react-i18next · sonner toasts · Supabase Realtime Broadcast

---

## Completed Work

All tasks below have been implemented. This plan documents what was built.

---

### Task 1: Shared UI Foundations

**Files:**
- `src/shared/ui/tokens.ts` — design tokens (colors, fonts, skill colors)
- `src/shared/ui/LogoMark.tsx` — SVG text logo, `width=240` default
- `src/shared/ui/AuthBackground.tsx` — shared dark aurora background + confetti for all auth pages
- `src/shared/ui/LanguageSwitcher.tsx` — EN/VI toggle
- `src/shared/ui/Pill.tsx` — badge chip component
- `src/shared/ui/BandSlider.tsx` — IELTS band score slider
- `src/shared/ui/SkillTile.tsx` — skill card tile
- `src/shared/hooks/useToast.ts` — sonner wrapper (`success`, `error`, `info`)
- `src/shared/i18n/en.ts`, `vi.ts`, `index.ts` — i18n translations

**What was built:**
- `AuthBackground` wraps all auth pages with `radial-gradient(ellipse at top, #2a1456, #0f0a1a)` + subtle confetti SVG
- `LogoMark` renders `/text-logo.svg` as `<img width={240} height="auto">`
- `tokens` exposes accent (`#aa3bff`), skill colors (reading/listening/writing/speaking), font, mono
- `useToast` wraps sonner: `error()` extracts `Error.message` and returns the string for inline display

---

### Task 2: Supabase Auth Setup

**Files:**
- `src/shared/api/supabase.ts` — Supabase client
- `src/shared/hooks/useAuth.ts` — Zustand store + `useAuthListener` hook

**What was built:**
- Supabase client with `detectSessionInUrl: true`, `persistSession: true`, `autoRefreshToken: true`
- `useAuthStore`: `user`, `session`, `loading`, `signInWithGoogle`, `signInWithEmail`, `signUp`, `signOut`
- `useAuthListener`: calls `getSession()` on mount, subscribes to `onAuthStateChange`, cleans URL hash after token exchange (`window.history.replaceState`)

---

### Task 3: Auth Forms (schemas + hooks)

**Files:**
- `src/features/auth/schemas/auth.schemas.ts` — Zod schemas for login, register, forgot-password
- `src/features/auth/hooks/useLoginForm.ts`
- `src/features/auth/hooks/useRegisterForm.ts`
- `src/features/auth/hooks/useForgotPasswordForm.ts`

**What was built:**
- `useRegisterForm`: on success → stores email in `sessionStorage('pending_verify_email')` → navigates to `/verify-email`
- `useLoginForm`: email + Google sign-in, error via `useToast`
- `useForgotPasswordForm`: `supabase.auth.resetPasswordForEmail`, `sent` state to show success screen

---

### Task 4: Auth Components

**Files:**
- `src/features/auth/components/SocialButton.tsx` — Google OAuth button
- `src/features/auth/components/OrDivider.tsx` — "or" divider
- `src/features/auth/components/PasswordInput.tsx` — password field with show/hide toggle (`tone: 'dark'|'light'`)
- `src/features/auth/components/PasswordStrength.tsx` — password strength indicator bar
- `src/features/auth/components/OTPInput.tsx` — 6-digit OTP input grid

---

### Task 5: Auth Pages

**Files:**
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/pages/RegisterPage.tsx`
- `src/features/auth/pages/VerifyEmailPage.tsx`
- `src/features/auth/pages/ForgotPasswordPage.tsx`
- `src/pages/Auth/CallbackPage.tsx`

**What was built:**

**LoginPage:** Dark glassmorphism card, Google OAuth + email/password, floating gamification chips (streak, XP, band score, online count), `tone="dark"` LanguageSwitcher.

**RegisterPage:** `<AuthBackground>` wrapper, glassmorphism card, Google OAuth + email/password + PasswordStrength, terms checkbox, navigates to `/verify-email` on success.

**VerifyEmailPage:** Two modes via `?mode=otp|link` query param.
- `LinkMode`: shows email, resend button (60s cooldown), cross-tab detection via `onAuthStateChange`, cross-device detection via Supabase Realtime Broadcast channel `email-verified:{userId}` with fallback poll every 5s on `CHANNEL_ERROR`.
- `OTPMode`: 6-digit OTP input, `supabase.auth.verifyOtp`.

**ForgotPasswordPage:** Email form → `supabase.auth.resetPasswordForEmail` → success screen.

**CallbackPage:** Handles `/auth/callback` redirect. Shows loading → verified screen (confetti, +50 XP reward, 3s countdown). On session confirmed: broadcasts `verified` event on `email-verified:{userId}` Realtime channel so `VerifyEmailPage` on another device navigates immediately.

---

### Task 6: Router & Providers

**Files:**
- `src/app/Router.tsx`
- `src/app/providers.tsx`

**What was built:**
- `ProtectedRoute`: redirects to `/login` if no user
- `AuthGuard`: redirects to `/` if already logged in
- `OnboardingGuard`: redirects to `/` if onboarding complete
- `<Toaster position="top-right" richColors closeButton />` in providers
- Routes: `/login`, `/register`, `/verify-email` (no guard), `/forgot-password`, `/auth/callback`, `/onboarding/*`, `/`

---

### Task 7: Onboarding Flow

**Files:**
- `src/features/onboarding/schemas/onboarding.schemas.ts`
- `src/features/onboarding/hooks/useOnboardingStore.ts`
- `src/features/onboarding/components/OnboardingShell.tsx`
- `src/features/onboarding/components/OnboardingWelcome.tsx`
- `src/features/onboarding/components/StepProfile.tsx`
- `src/features/onboarding/components/StepPlacement.tsx`
- `src/features/onboarding/components/StepGoals.tsx`
- `src/features/onboarding/components/StepSummary.tsx`

**What was built:**
- `useOnboardingStore`: Zustand persist (`ivelox_onboarding` localStorage key), tracks `currentStep`, `isComplete`, profile, selfReport, goals. `complete()` optimistically sets `isComplete: true` then posts to `/api/onboarding`.
- 4-step flow: Profile → Placement (self-reported band per skill) → Goals (preset + target band + date) → Summary
- `OnboardingWelcome`: dark aurora screen with confetti, XP steps preview, "Let's go" CTA
- `OnboardingShell`: sticky header with logo + step progress indicator

---

### Task 8: Home Dashboard

**Files:**
- `src/pages/Home/HomePage.tsx`

**What was built:**
- Sticky header: logo, language switcher, avatar initial, sign out
- Hero: greeting with user name, avg estimated band from `selfReport`, target band from onboarding
- Quick stats row: Day Streak, Total XP, Est. Band, Lessons Done (placeholder values — pending API)
- Skill cards grid (2×2): Reading/Listening/Writing/Speaking with band from `selfReport`, XP progress bar, level (placeholder — pending API)
- Start Practice CTA button

**Note:** XP, level, streak, lessons count are placeholder values. Replace with API data from Go backend once `/api/v1/progress` endpoint is available.

---

## Pending / Next Steps

| Item | Notes |
|---|---|
| Real progress data on Home | Replace placeholder XP/streak with `GET /api/v1/progress` |
| Practice flows | `/reading`, `/listening`, `/writing`, `/speaking` routes |
| Apple OAuth | Not implemented (Google only per spec) |
| Password reset page | `/auth/reset-password` — `supabase.auth.updateUser` |
| Profile settings | Edit display name, avatar, goals |
