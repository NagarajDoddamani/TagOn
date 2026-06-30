import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function ProtectedRoute({ children, requireAuth, requireAdmin, requireGuest }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const currentPath = location.pathname + location.search

  if (requireGuest && isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  if (requireAdmin) {
    if (!isAuthenticated) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
    }
    if (user?.role !== 'admin') {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
