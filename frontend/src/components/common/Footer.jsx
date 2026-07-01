import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paymentService } from '../../services/payment.service'

export default function Footer() {
  const [biz, setBiz] = useState({ business_name: 'TagOn', logo_url: '', phone: '', email: '' })

  useEffect(() => {
    paymentService.getBusinessInfo().then(setBiz).catch(() => {})
  }, [])

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {biz.logo_url && (
                <img src={biz.logo_url} alt="Logo" className="h-8 w-auto rounded" onError={(e) => { e.target.style.display = 'none' }} />
              )}
              <h3 className="text-xl font-bold text-primary-400">{biz.business_name || 'TagOn'}</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Personalized gifts crafted with love. Create unique, memorable gifts for every occasion.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {biz.email && <li>Email: {biz.email}</li>}
              {biz.phone && <li>Phone: {biz.phone}</li>}
              {!biz.email && !biz.phone && <li>Email: support@tagon.com</li>}
              <li>Follow us on social media</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {biz.business_name || 'TagOn'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
