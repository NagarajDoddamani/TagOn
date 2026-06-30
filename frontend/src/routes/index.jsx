import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import LandingPage from '../pages/public/LandingPage'
import ProductListingPage from '../pages/customer/ProductListingPage'
import ProductDetailPage from '../pages/customer/ProductDetailPage'
import OrdersPage from '../pages/customer/OrdersPage'
import OrderDetailPage from '../pages/customer/OrderDetailPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ProfilePage from '../pages/customer/ProfilePage'
import ProtectedRoute from '../components/common/ProtectedRoute'

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminReports = lazy(() => import('../pages/admin/AdminReports'))
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'))
const AdminCustomerDetail = lazy(() => import('../pages/admin/AdminCustomerDetail'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
const AdminProductManagement = lazy(() => import('../pages/admin/AdminProductManagement'))
const AdminOrderManagement = lazy(() => import('../pages/admin/AdminOrderManagement'))
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'))
const AdminOrderWorkspace = lazy(() => import('../pages/admin/AdminOrderWorkspace'))
const AdminTemplateGroups = lazy(() => import('../pages/admin/AdminTemplateGroups'))

function AdminSuspense({ children }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    }>
      {children}
    </Suspense>
  )
}

function NotFoundRedirect() {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  return <Navigate to="/" replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'products', element: <ProductListingPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      {
        path: 'orders',
        element: <ProtectedRoute requireAuth><OrdersPage /></ProtectedRoute>,
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute requireAuth><OrderDetailPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute requireAuth><ProfilePage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <ProtectedRoute requireGuest><LoginPage /></ProtectedRoute>,
      },
      {
        path: 'register',
        element: <ProtectedRoute requireGuest><RegisterPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/admin',
    element: <MainLayout />,
    children: [
      { index: true, element: <ProtectedRoute requireAdmin><AdminSuspense><AdminDashboard /></AdminSuspense></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminProductManagement /></AdminSuspense></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminOrderManagement /></AdminSuspense></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminOrderWorkspace /></AdminSuspense></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminReports /></AdminSuspense></ProtectedRoute> },
      { path: 'customers', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminCustomers /></AdminSuspense></ProtectedRoute> },
      { path: 'customers/:id', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminCustomerDetail /></AdminSuspense></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminSettings /></AdminSuspense></ProtectedRoute> },
      { path: 'reviews', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminReviews /></AdminSuspense></ProtectedRoute> },
      { path: 'template-groups', element: <ProtectedRoute requireAdmin><AdminSuspense><AdminTemplateGroups /></AdminSuspense></ProtectedRoute> },
    ],
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
])
