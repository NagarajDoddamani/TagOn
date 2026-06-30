import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = 'text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors'
  const mobileNavLinkClass = 'block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors'

  const customerLinks = (
    <>
      <Link to="/" className={navLinkClass} aria-label="Home">Home</Link>
      <Link to="/products" className={navLinkClass} aria-label="Products">Products</Link>
      <Link to="/orders" className={navLinkClass} aria-label="My Orders">My Orders</Link>
    </>
  )

  const adminLinks = (
    <>
      <Link to="/admin" className={navLinkClass} aria-label="Dashboard">Dashboard</Link>
      <Link to="/admin/products" className={navLinkClass} aria-label="Products">Products</Link>
      <Link to="/admin/orders" className={navLinkClass} aria-label="Orders">Orders</Link>
      <Link to="/admin/reports" className={navLinkClass} aria-label="Reports">Reports</Link>
      <Link to="/admin/customers" className={navLinkClass} aria-label="Customers">Customers</Link>
      <Link to="/admin/settings" className={navLinkClass} aria-label="Settings">Settings</Link>
    </>
  )

  const mobileCustomerLinks = (
    <>
      <Link to="/" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Home</Link>
      <Link to="/products" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Products</Link>
      <Link to="/orders" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>My Orders</Link>
    </>
  )

  const mobileAdminLinks = (
    <>
      <Link to="/admin" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Dashboard</Link>
      <Link to="/admin/products" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Products</Link>
      <Link to="/admin/orders" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Orders</Link>
      <Link to="/admin/reports" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Reports</Link>
      <Link to="/admin/customers" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Customers</Link>
      <Link to="/admin/settings" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Settings</Link>
    </>
  )

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600" aria-label="TagOn Home">
              TagOn
            </Link>
            <div className="hidden md:flex ml-10 space-x-1">
              {isAuthenticated && user?.role === 'customer' && customerLinks}
              {isAuthenticated && user?.role === 'admin' && adminLinks}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm transition-colors"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors" aria-label="Login">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium transition-colors" aria-label="Register">
                  Register
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 animate-fade-in" role="menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isAuthenticated && (
              <div className="space-y-1 pb-2 border-b border-gray-100 mb-2">
                <Link to="/login" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className={mobileNavLinkClass} onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="text-sm text-gray-500 px-3 py-1">{user?.name}</div>
            )}
            {isAuthenticated && user?.role === 'customer' && mobileCustomerLinks}
            {isAuthenticated && user?.role === 'admin' && mobileAdminLinks}
          </div>
        </div>
      )}
    </nav>
  )
}
