import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { useOnboardingStore } from '@/features/onboarding/hooks/useOnboardingStore'

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'

// Onboarding pages
import { OnboardingWelcome } from '@/features/onboarding/components/OnboardingWelcome'
import { StepProfile } from '@/features/onboarding/components/StepProfile'
import { StepPlacement } from '@/features/onboarding/components/StepPlacement'
import { StepGoals } from '@/features/onboarding/components/StepGoals'
import { StepSummary } from '@/features/onboarding/components/StepSummary'

// Existing pages
import CallbackPage from '@/pages/Auth/CallbackPage'
import HomePage from '@/pages/Home/HomePage'

// ── Guards ────────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isComplete } = useOnboardingStore()
  if (isComplete) return <Navigate to="/" replace />
  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf9f5' }}>
      <div style={{ fontSize: 14, color: '#9ca3af', fontFamily: 'system-ui, sans-serif' }}>Loading...</div>
    </div>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes — redirect to / if already logged in */}
        <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
        <Route path="/register" element={<AuthGuard><RegisterPage /></AuthGuard>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<AuthGuard><ForgotPasswordPage /></AuthGuard>} />
        <Route path="/auth/callback" element={<CallbackPage />} />

        {/* Onboarding routes — protected + onboarding guard */}
        <Route path="/onboarding" element={<Navigate to="/onboarding/welcome" replace />} />
        <Route path="/onboarding/welcome" element={
          <ProtectedRoute><OnboardingGuard><OnboardingWelcome /></OnboardingGuard></ProtectedRoute>
        } />
        <Route path="/onboarding/step/1" element={
          <ProtectedRoute><OnboardingGuard><StepProfile /></OnboardingGuard></ProtectedRoute>
        } />
        <Route path="/onboarding/step/2" element={
          <ProtectedRoute><OnboardingGuard><StepPlacement /></OnboardingGuard></ProtectedRoute>
        } />
        <Route path="/onboarding/step/3" element={
          <ProtectedRoute><OnboardingGuard><StepGoals /></OnboardingGuard></ProtectedRoute>
        } />
        <Route path="/onboarding/step/4" element={
          <ProtectedRoute><OnboardingGuard><StepSummary /></OnboardingGuard></ProtectedRoute>
        } />

        {/* Home — protected */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
