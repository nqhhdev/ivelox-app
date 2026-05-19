# Auth + Onboarding Design Spec

**Date:** 2026-05-18
**Status:** Approved
**Author:** nqhhdev

---

## 1. Overview

Build the Auth and Onboarding flows for iVelox — an IELTS learning platform. The design follows the Ludocode gamified shell direction: premium, energetic, game-y but trustworthy. Visual reference extracted from `iVelox Design.html`.

**Scope:**
- Auth: Login (V1/V2/V3), Register, Verify Email (link + OTP), Forgot Password — all responsive
- Onboarding: Welcome + 4 steps (Profile → Placement → Goals → Summary)
- Multi-language: English + Vietnamese (react-i18next)
- Forms: React Hook Form + Zod
- State: Zustand + localStorage persist + BE sync queue

---

## 2. Architecture

### 2.1 File Structure

```
src/
  features/
    auth/
      components/
        AuthShell.tsx           # Wrapper: logo, brand ornaments, bg gradient
        SocialButton.tsx        # Google OAuth button
        OrDivider.tsx           # "or" line divider
        PasswordStrength.tsx    # Password strength meter (4-bar)
        OTPInput.tsx            # 6-digit OTP code input
      pages/
        LoginPage.tsx           # Accepts variant?: 'v1' | 'v2' | 'v3'
        RegisterPage.tsx
        VerifyEmailPage.tsx     # Accepts mode?: 'link' | 'otp'
        ForgotPasswordPage.tsx
      hooks/
        useLoginForm.ts
        useRegisterForm.ts
        useForgotPasswordForm.ts
      schemas/
        auth.schemas.ts         # Zod schemas for all auth forms
      i18n/
        en.ts
        vi.ts
    onboarding/
      components/
        OnboardingShell.tsx     # Header + 4-step progress bar + back/skip
        StepProfile.tsx         # Step 1: display name, native language, IELTS type
        StepPlacement.tsx       # Step 2: self-report band sliders per skill
        StepGoals.tsx           # Step 3: goal preset cards + target date
        StepSummary.tsx         # Step 4: summary of all selections + finish
        OnboardingWelcome.tsx   # Welcome screen (dark, confetti)
      hooks/
        useOnboardingStore.ts   # Zustand store with localStorage persist
      schemas/
        onboarding.schemas.ts   # Zod schemas for onboarding steps
      i18n/
        en.ts
        vi.ts
  shared/
    i18n/
      index.ts                  # react-i18next init, language detection
      en.ts                     # Merged: auth + onboarding + common
      vi.ts
    ui/
      tokens.ts                 # Design tokens (colors, typography)
      PrimaryButton.tsx
      GhostButton.tsx
      Input.tsx                 # label + icon + error + helper text
      OrDivider.tsx
      Pill.tsx
      LanguageSwitcher.tsx      # EN/VI toggle, persists to localStorage
      BrandOrnament.tsx         # Decorative bg orbs
      LogoMark.tsx              # iVelox logo mark + text
      SkillTile.tsx             # Skill icon tile (Reading/Listening/Writing/Speaking)
      BandSlider.tsx            # IELTS band 1–9 interactive slider
```

### 2.2 Design Tokens

```ts
// src/shared/ui/tokens.ts
export const tokens = {
  accent: '#aa3bff',
  accentSoft: '#faf5ff',
  accentBorder: '#e9d5ff',
  ink: '#0a0e27',
  text: '#4b5563',
  muted: '#9ca3af',
  bg: '#faf9f5',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  danger: '#ef4444',
  skills: {
    reading:   { color: '#3b82f6', soft: '#eff6ff' },
    listening: { color: '#f59e0b', soft: '#fffbeb' },
    writing:   { color: '#f43f5e', soft: '#fff1f2' },
    speaking:  { color: '#14b8a6', soft: '#f0fdfa' },
  },
  font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
}
```

---

## 3. Routing & Navigation

### 3.1 Route Table

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | `LoginPage` (default V2) | AuthGuard (redirect `/` if logged in) |
| `/login?v=1` | `LoginPage` V1 | AuthGuard |
| `/login?v=3` | `LoginPage` V3 | AuthGuard |
| `/register` | `RegisterPage` | AuthGuard |
| `/verify-email` | `VerifyEmailPage` (link mode) | — |
| `/verify-email?mode=otp` | `VerifyEmailPage` (OTP mode) | — |
| `/forgot-password` | `ForgotPasswordPage` | AuthGuard |
| `/auth/callback` | `CallbackPage` | — |
| `/onboarding` | Redirect → `/onboarding/welcome` | ProtectedRoute |
| `/onboarding/welcome` | `OnboardingWelcome` | ProtectedRoute + OnboardingGuard |
| `/onboarding/step/1` | `StepProfile` | ProtectedRoute + OnboardingGuard |
| `/onboarding/step/2` | `StepPlacement` | ProtectedRoute + OnboardingGuard |
| `/onboarding/step/3` | `StepGoals` | ProtectedRoute + OnboardingGuard |
| `/onboarding/step/4` | `StepSummary` | ProtectedRoute + OnboardingGuard |
| `/` | `HomePage` | ProtectedRoute |

### 3.2 Navigation Flows

**New user (email):**
```
/register → /verify-email → /onboarding/welcome → /onboarding/step/1 → ... → /onboarding/step/4 → /
```

**New user (Google OAuth):**
```
/login → Google OAuth → /auth/callback → check onboarding_complete
  → false: /onboarding/welcome
  → true: /
```

**Returning user:**
```
/login → / (onboarding_complete = true, skip onboarding)
```

### 3.3 Route Guards

- **AuthGuard** — redirect to `/` if user is already logged in
- **ProtectedRoute** — redirect to `/login` if not logged in (already exists)
- **OnboardingGuard** — redirect to `/` if `onboarding_complete = true`

---

## 4. Auth Screens

### 4.1 Login Page

Three visual variants via `?v=` query param:

| Variant | Description |
|---------|-------------|
| V1 | Centered card, light bg, brand ornaments, tab toggle Sign in / Create account |
| V2 (default) | Split hero: dark left panel (stats, streaks, testimonial) + white right form |
| V3 | Full dark game-y, dot grid bg, floating achievement badges, glassmorphism card |

**All variants contain:**
- iVelox LogoMark
- Google OAuth button (Apple removed per design decision)
- Email + Password fields with validation
- "Remember me" checkbox + "Forgot password?" link
- Sign in / Create account toggle
- Language switcher (EN/VI)

### 4.2 Register Page

- Same layout as Login V1
- Email + Password fields
- Password strength meter (4-bar: Weak → Fair → Good → Strong)
- Terms & Privacy Policy agreement checkbox
- "Already have an account? Sign in" link

### 4.3 Verify Email Page

**Link mode (default):**
- Animated email icon hero
- "Check your inbox" heading
- Waiting status card with pulsing dot + countdown timer
- Resend email + Use different email buttons
- "Next up" teaser card (band placement test)

**OTP mode (`?mode=otp`):**
- 6-digit input boxes (auto-focus, auto-advance)
- "Verify and continue" CTA
- Resend code with countdown timer
- Code expiry indicator

### 4.4 Forgot Password Page

- Email input
- "Send reset link" CTA
- Confirmation state: "Check your inbox" with back to login link

---

## 5. Onboarding Screens

### 5.1 Shared OnboardingShell

- Logo top-left
- 4-step progress: Profile → Placement → Goals → Summary
  - Done steps: filled accent circle with checkmark
  - Current step: accent border + glow ring
  - Future steps: muted
  - Connector line fills accent when step done
- "Skip for now" link (top-right, visible on steps 1–3)
- Back button (bottom-left)

### 5.2 Welcome Screen

- Dark background (radial gradient `#2a1456 → #0f0a1a`)
- Confetti SVG overlay
- "ACCOUNT VERIFIED" pill badge
- "Welcome to iVelox, [name]." heading with gradient name
- 4-step preview cards: Profile (+20 XP), Placement (+80 XP), Goals (+40 XP), You're in (+60 XP)
- "Start setup · 3 min" CTA button
- "+200 XP available across all steps" note

### 5.3 Step 1 — Profile

- Display name input (2–24 chars)
- Avatar: initials gradient circle + upload/generate buttons
- Native language selector: pill buttons with flags (🇻🇳 Vietnamese, 🇨🇳 Chinese, 🇯🇵 Japanese, 🇰🇷 Korean, 🇹🇭 Thai, 🇮🇩 Indonesian, Other)
- IELTS type: 2-card selector (Academic / General Training)
- CTA: "Save & continue · +20 XP"

### 5.4 Step 2 — Placement (V1 only)

- "Where do you think you stand?" heading
- 4 `BandSlider` components (Reading, Listening, Writing, Speaking)
  - Each: skill color accent bar, band number display, 1–9 slider
- "Not sure? Take a 5-question quick test" promo card (links to future feature)
- CTA: "Continue · +60 XP"

### 5.5 Step 3 — Goals

- "What's the mission?" heading
- 6 goal preset cards in grid:
  - Study abroad (band 6.5), Migration (7.0), Career (7.5), Just to improve (6.0), High score chase (8.0), Custom
- Target date picker: 30d / 60d / 90d / 6m / 1y / No date
- CTA: "Lock in mission · +40 XP"

### 5.6 Step 4 — Summary

- Summary of all selections: name, avatar, language, IELTS type, band estimates, goal, target date
- Total XP earned display
- "First mission unlocks" teaser
- CTA: "Let's go →" → POST `/api/onboarding` → navigate to `/`

---

## 6. i18n Setup

**Library:** `react-i18next` + `i18next-browser-languagedetector`

**Language detection order:**
1. `localStorage` key `i18n_lang`
2. `navigator.language`
3. Fallback: `en`

**Namespace structure:**
```ts
// All namespaces merged into single resource per language
{
  common: { back, continue, skip, save, loading, error... },
  auth: { login, register, verifyEmail, forgotPassword... },
  onboarding: { welcome, step1, step2, step3, step4... }
}
```

**Language switcher:** Floating toggle in AuthShell and OnboardingShell top-right. Clicking saves to `localStorage` and hot-swaps language instantly.

---

## 7. State Management

### 7.1 Auth Store (extend existing)

```ts
// Add to useAuthStore
isNewUser: boolean   // true = redirect to onboarding after login
```

Set `isNewUser = true` in `signUp()`, `false` in `signInWithEmail/Google` when user already has `onboarding_complete`.

### 7.2 Onboarding Store

```ts
interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4
  isComplete: boolean
  // Step 1
  displayName: string
  nativeLanguage: 'vi' | 'zh' | 'ja' | 'ko' | 'th' | 'id' | 'other'
  avatarUrl: string | null
  ieltsType: 'academic' | 'general'
  // Step 2
  selfReport: { reading: number; listening: number; writing: number; speaking: number }
  // Step 3
  goalPreset: 'study_abroad' | 'migration' | 'career' | 'improve' | 'high_score' | 'custom'
  targetBand: number
  targetDate: string | null
  // Actions
  setStep(step: number): void
  updateProfile(data: ProfileData): void
  updatePlacement(data: PlacementData): void
  updateGoals(data: GoalsData): void
  complete(): Promise<void>
  reset(): void
}
```

**Persist:** Zustand `persist` middleware → `localStorage` key `ivelox_onboarding`. Partial persist — excludes action functions.

### 7.3 Offline / Network Strategy

```
User action (form submit)
  → update Zustand store immediately (optimistic)
  → persist to localStorage
  → attempt POST to BE API via client.ts
    → success: set isComplete = true server-confirmed
    → network error: set isComplete = true locally, queue retry on next load
    → server error: show toast error, keep user on current step
```

BE API endpoints (mày sẽ implement):
- `POST /api/onboarding` — save full onboarding data, mark complete
- `GET /api/profile` — check onboarding_complete on app load

---

## 8. Form Validation (Zod Schemas)

```ts
// features/auth/schemas/auth.schemas.ts
loginSchema: { email: string().email(), password: string().min(8) }
registerSchema: { email, password (min 8, has number), agreeTerms: literal(true) }
forgotPasswordSchema: { email }
verifyOTPSchema: { code: string().length(6).regex(/^\d{6}$/) }

// features/onboarding/schemas/onboarding.schemas.ts
profileSchema: { displayName: string().min(2).max(24), nativeLanguage: enum, ieltsType: enum }
placementSchema: { reading/listening/writing/speaking: number().min(1).max(9) }
goalsSchema: { goalPreset: enum, targetBand: number().min(1).max(9), targetDate: string().nullable() }
```

---

## 9. Visual Design

### 9.1 Auth Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| accent | `#aa3bff` | Primary CTA, active states, focus rings |
| ink | `#0a0e27` | Headings, primary text |
| bg | `#faf9f5` | Page background (light mode) |
| dark bg | `#0f0a1a` | V3 login, Welcome screen |

### 9.2 Login V2 Layout (default)

- Left panel: `linear-gradient(160deg, #2a1456, #0f0a1a)`, 55% width
  - Logo, tagline, 3 stats (312 tests, 7.5+ avg band, 90K learners)
  - Floating stat cards (streak + XP)
  - Testimonial quote
- Right panel: white, 45% width
  - Welcome back heading + streak message
  - Google button + or divider + email form

### 9.3 Onboarding Skill Colors

| Skill | Color | Soft bg |
|-------|-------|---------|
| Reading | `#3b82f6` | `#eff6ff` |
| Listening | `#f59e0b` | `#fffbeb` |
| Writing | `#f43f5e` | `#fff1f2` |
| Speaking | `#14b8a6` | `#f0fdfa` |

---

## 10. Dependencies to Add

```json
"react-hook-form": "^7.x",
"zod": "^3.x",
"@hookform/resolvers": "^3.x",
"react-i18next": "^14.x",
"i18next": "^23.x",
"i18next-browser-languagedetector": "^8.x"
```

---

## 11. Out of Scope (này phase sau)

- Quick placement test (5 real questions) — Step 2 V2
- Apple OAuth
- Avatar image upload to storage
- BE retry queue (localStorage flag only for now)
- Dark mode
- Weekly leagues, leaderboards
