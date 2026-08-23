import { Navigate } from 'react-router-dom'

/** Legacy IELTS home — replaced by public portfolio. */
export default function HomePage() {
  return <Navigate to="/" replace />
}
