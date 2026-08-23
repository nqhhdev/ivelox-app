import { Navigate } from 'react-router-dom'

/** @deprecated Supabase OAuth callback removed */
export default function CallbackPage() {
  return <Navigate to="/login" replace />
}
