import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { paymentService } from '../../services/payment.service'
import { confirmLogout } from '../../utils/swal'

const navClass = ({ isActive }) =>
  `${isActive ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`

const mobileNavClass = ({ isActive }) =>
  `block ${isActive ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'} px-3 py-2 rounded-md text-sm font-medium transition-colors`

const btnClass = 'text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors'
const registerClass = 'bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium transition-colors'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const closeMobile = () => setMobileOpen(false)

  useEffect(() => {
    paymentService.getBusinessInfo().then(d => setLogoUrl(d.logo_url || '')).catch(() => {})
  }, [])

  const handleLogout = async () => {
    const result = await confirmLogout()
    if (!result.isConfirmed) return
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" end className="flex items-center gap-2 text-xl font-bold text-primary-600" aria-label="TagOn Home">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 w-auto rounded" onError={(e) => { e.target.style.display = 'none' }} />
              ) : null}
              TagOn
            </NavLink>
            <div className="hidden md:flex ml-10 space-x-1">
              {!isAuthenticated && (
                <>
                  <NavLink to="/" end className={navClass}>Home</NavLink>
                  <NavLink to="/products" end className={navClass}>Products</NavLink>
                </>
              )}
              {isAuthenticated && user?.role === 'customer' && (
                <>
                  <NavLink to="/" end className={navClass}>Home</NavLink>
                  <NavLink to="/products" end className={navClass}>Products</NavLink>
                  <NavLink to="/orders" end className={navClass}>My Orders</NavLink>
                  <NavLink to="/profile" end className={navClass}>Profile</NavLink>
                </>
              )}
                {isAuthenticated && user?.role === 'admin' && (
                  <>
                    <NavLink to="/admin" end className={navClass}>Dashboard</NavLink>
                    <NavLink to="/admin/products" end className={navClass}>Products</NavLink>
                    <NavLink to="/admin/template-groups" end className={navClass}>Template Groups</NavLink>
                    <NavLink to="/admin/orders" end className={navClass}>Orders</NavLink>
                    <NavLink to="/admin/reviews" end className={navClass}>Reviews</NavLink>
                    <NavLink to="/admin/reports" end className={navClass}>Reports</NavLink>
                    <NavLink to="/admin/customers" end className={navClass}>Customers</NavLink>
                    <NavLink to="/admin/settings" end className={navClass}>Settings</NavLink>
                  </>
                )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <div className="hidden sm:flex items-center space-x-2">
                <NavLink to="/login" end className={btnClass}>Login</NavLink>
                <NavLink to="/register" end className={registerClass}>Register</NavLink>
              </div>
            )}
            {isAuthenticated && (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm transition-colors"
                >
                  Logout
                </button>
              </>
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

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 animate-fade-in" role="menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isAuthenticated && (
              <>
                <div className="space-y-1 pb-2 border-b border-gray-100 mb-2">
                  <NavLink to="/login" end className={mobileNavClass} onClick={closeMobile}>Login</NavLink>
                  <NavLink to="/register" end className={mobileNavClass} onClick={closeMobile}>Register</NavLink>
                </div>
                <NavLink to="/" end className={mobileNavClass} onClick={closeMobile}>Home</NavLink>
                <NavLink to="/products" end className={mobileNavClass} onClick={closeMobile}>Products</NavLink>
              </>
            )}
            {isAuthenticated && (
              <>
                <div className="text-sm text-gray-500 px-3 py-1">{user?.name}</div>
                {user?.role === 'customer' && (
                  <>
                    <NavLink to="/" end className={mobileNavClass} onClick={closeMobile}>Home</NavLink>
                    <NavLink to="/products" end className={mobileNavClass} onClick={closeMobile}>Products</NavLink>
                    <NavLink to="/orders" end className={mobileNavClass} onClick={closeMobile}>My Orders</NavLink>
                    <NavLink to="/profile" end className={mobileNavClass} onClick={closeMobile}>Profile</NavLink>
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                    <NavLink to="/admin" end className={mobileNavClass} onClick={closeMobile}>Dashboard</NavLink>
                    <NavLink to="/admin/products" end className={mobileNavClass} onClick={closeMobile}>Products</NavLink>
                    <NavLink to="/admin/template-groups" end className={mobileNavClass} onClick={closeMobile}>Template Groups</NavLink>
                    <NavLink to="/admin/orders" end className={mobileNavClass} onClick={closeMobile}>Orders</NavLink>
                    <NavLink to="/admin/reviews" end className={mobileNavClass} onClick={closeMobile}>Reviews</NavLink>
                    <NavLink to="/admin/reports" end className={mobileNavClass} onClick={closeMobile}>Reports</NavLink>
                    <NavLink to="/admin/customers" end className={mobileNavClass} onClick={closeMobile}>Customers</NavLink>
                    <NavLink to="/admin/settings" end className={mobileNavClass} onClick={closeMobile}>Settings</NavLink>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
