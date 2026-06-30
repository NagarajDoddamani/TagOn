import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function ProtectedRoute({ children, requireAdmin }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
