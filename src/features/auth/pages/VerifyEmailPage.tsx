import { Navigate } from 'react-router-dom'

/** @deprecated */
export function VerifyEmailPage() {
  return <Navigate to="/login" replace />
}
