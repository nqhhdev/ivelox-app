import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/hooks/useAuth'
import { usePlatformFeatures } from '@/shared/hooks/usePlatformFeatures'
import { OtpLoginPage } from '@/features/auth/pages/OtpLoginPage'
import { PortfolioPage } from '@/features/portfolio/pages/PortfolioPage'
import { HealthDashboardPage } from '@/features/health/pages/HealthDashboardPage'
import { MealLogPage } from '@/features/health/pages/MealLogPage'
import { BodyMetricsPage } from '@/features/health/pages/BodyMetricsPage'
import { GoalsPage } from '@/features/health/pages/GoalsPage'
import { BurnsPage } from '@/features/health/pages/BurnsPage'
import { WeeklyPage } from '@/features/health/pages/WeeklyPage'

function LoadingScreen() {
  return (
    <div className="grg-loading" aria-live="polite">
      Loading
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/health" replace />
  return <>{children}</>
}

function HealthRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = usePlatformFeatures()
  if (isLoading) return <LoadingScreen />
  if (isError || data?.health.enabled === false) {
    return <Navigate to="/" replace />
  }
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/login" element={<AuthGuard><OtpLoginPage /></AuthGuard>} />

        <Route path="/health" element={<HealthRoute><HealthDashboardPage /></HealthRoute>} />
        <Route path="/health/log" element={<HealthRoute><MealLogPage /></HealthRoute>} />
        <Route path="/health/body" element={<HealthRoute><BodyMetricsPage /></HealthRoute>} />
        <Route path="/health/goals" element={<HealthRoute><GoalsPage /></HealthRoute>} />
        <Route path="/health/burns" element={<HealthRoute><BurnsPage /></HealthRoute>} />
        <Route path="/health/weekly" element={<HealthRoute><WeeklyPage /></HealthRoute>} />

        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/verify-email" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/auth/callback" element={<Navigate to="/login" replace />} />
        <Route path="/onboarding/*" element={<Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
