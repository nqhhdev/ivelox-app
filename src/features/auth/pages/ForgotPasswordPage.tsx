import { Navigate } from 'react-router-dom'

/** @deprecated */
export function ForgotPasswordPage() {
  return <Navigate to="/login" replace />
}
