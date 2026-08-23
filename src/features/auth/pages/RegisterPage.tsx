import { Navigate } from 'react-router-dom'

/** @deprecated */
export function RegisterPage() {
  return <Navigate to="/login" replace />
}
