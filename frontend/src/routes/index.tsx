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
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProductManagement from '../pages/admin/AdminProductManagement'
import AdminOrderManagement from '../pages/admin/AdminOrderManagement'
import ProtectedRoute from '../components/common/ProtectedRoute'

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
      { index: true, element: <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute> },
      { path: 'products', element: <ProtectedRoute requireAdmin><AdminProductManagement /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute requireAdmin><AdminOrderManagement /></ProtectedRoute> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
