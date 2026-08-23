import { Navigate } from 'react-router-dom'

/** @deprecated Use OtpLoginPage at /login */
export function LoginPage() {
  return <Navigate to="/login" replace />
}
