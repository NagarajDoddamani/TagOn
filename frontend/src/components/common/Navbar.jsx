import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              TagOn
            </Link>
            {isAuthenticated && user?.role === 'customer' && (
              <div className="ml-10 flex space-x-4">
                <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Home
                </Link>
                <Link to="/products" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Products
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  My Orders
                </Link>
              </div>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <div className="ml-10 flex space-x-4">
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Products
                </Link>
                <Link to="/admin/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Orders
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
