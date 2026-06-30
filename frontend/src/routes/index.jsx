import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import HomePage from '../pages/customer/HomePage'
import ProductListingPage from '../pages/customer/ProductListingPage'
import ProductDetailPage from '../pages/customer/ProductDetailPage'
import OrdersPage from '../pages/customer/OrdersPage'
import OrderDetailPage from '../pages/customer/OrderDetailPage'
import ProtectedRoute from '../components/common/ProtectedRoute'

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminReports = lazy(() => import('../pages/admin/AdminReports'))
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'))
const AdminCustomerDetail = lazy(() => import('../pages/admin/AdminCustomerDetail'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
const AdminProductManagement = lazy(() => import('../pages/admin/AdminProductManagement'))
const AdminOrderManagement = lazy(() => import('../pages/admin/AdminOrderManagement'))
const AdminOrderWorkspace = lazy(() => import('../pages/admin/AdminOrderWorkspace'))

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute><ProductListingPage /></ProtectedRoute> },
      { path: 'products/:id', element: <ProtectedRoute><ProductDetailPage /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
