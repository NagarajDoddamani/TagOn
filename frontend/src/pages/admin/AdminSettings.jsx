import { useState, useEffect } from 'react'
import { adminService } from '../../services/admin.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const TABS = [
  { id: 'business_info', label: 'Business Info' },
  { id: 'qr_config', label: 'QR Payment' },
  { id: 'contact', label: 'Contact & Social' },
  { id: 'retention', label: 'Retention' },
  { id: 'preferences', label: 'Preferences' },
]

const LABEL_MAP = {
  business_name: 'Business Name',
  tagline: 'Tagline',
  address: 'Address',
  logo_url: 'Logo URL',
  upi_id: 'UPI ID',
  merchant_name: 'Merchant Name',
  qr_image_url: 'QR Image URL',
  phone: 'Phone',
  email: 'Email',
  facebook: 'Facebook URL',
  instagram: 'Instagram URL',
  twitter: 'Twitter URL',
  default_points: 'Default Signup Points',
  referral_bonus: 'Referral Bonus Points',
  points_expiry_days: 'Points Expiry (days)',
  currency: 'Currency',
  timezone: 'Timezone',
  auto_cancel_hours: 'Auto-Cancel Orders After (hours)',
  low_stock_threshold: 'Low Stock Threshold',
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('business_info')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await adminService.getSettingsGroup(activeTab)
        setValues(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab])

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const updated = await adminService.updateSettingsGroup(activeTab, values)
      setValues(updated)
      setMessage('Settings saved successfully.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition ${
              activeTab === t.id
                ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4 max-w-xl">
            {Object.entries(values).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {LABEL_MAP[key] || key}
                </label>
                {typeof val === 'boolean' ? (
                  <select
                    value={val ? 'true' : 'false'}
                    onChange={(e) => handleChange(key, e.target.value === 'true')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : typeof val === 'number' ? (
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleChange(key, Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {message && (
              <span className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
