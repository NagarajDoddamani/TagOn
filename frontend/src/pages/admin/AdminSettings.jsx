import { useState, useEffect } from 'react'
import { adminService } from '../../services/admin.service'
import { toast } from '../../store/toast.store'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { success as swalSuccess, error as swalError } from '../../utils/swal'

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
  logo_url: 'Logo',
  upi_id: 'UPI ID',
  merchant_name: 'Merchant Name',
  qr_image_url: 'QR Code Image',
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

const DESCRIPTIONS = {
  retention: {
    default_points: 'Points awarded to new customers when they create an account. Encourages sign-ups.',
    referral_bonus: 'Points given to both the referrer and the referred friend when a referral succeeds.',
    points_expiry_days: 'Number of days before unused points expire. Encourages customers to use them.',
  },
  preferences: {
    currency: 'Currency symbol/code shown on prices throughout the store.',
    timezone: 'Timezone used for order timestamps, reports, and auto-cancel logic.',
    auto_cancel_hours: 'Orders stuck in "payment pending" for this many hours are automatically cancelled.',
    low_stock_threshold: 'When variant stock drops to this number, admin gets a low-stock alert.',
  },
}

const IMAGE_FIELDS = {
  business_info: ['logo_url'],
  qr_config: ['qr_image_url'],
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('business_info')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null)

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

  const handleImageUpload = async (key, file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP images allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setUploading(key)
    try {
      const updated = await adminService.uploadSettingsImage(activeTab, key, file)
      setValues(updated)
      swalSuccess('Image uploaded successfully')
    } catch (err) {
      swalError('Upload Failed', err.response?.data?.detail || 'Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await adminService.updateSettingsGroup(activeTab, values)
      setValues(updated)
      swalSuccess('Settings saved successfully')
    } catch (err) {
      swalError('Operation Failed', 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const isImageField = (key) => IMAGE_FIELDS[activeTab]?.includes(key)

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
          {activeTab === 'retention' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Customer Retention Program</h3>
              <p className="text-sm text-blue-700">
                Reward your customers with points for purchases, referrals, and sign-ups.
                Points encourage repeat business and word-of-mouth marketing.
                Set how many points to award and when they expire.
              </p>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Store Preferences</h3>
              <p className="text-sm text-blue-700">
                Configure your store's currency, timezone, and operational thresholds.
                These settings affect pricing display, order management, and inventory alerts.
              </p>
            </div>
          )}

          <div className="space-y-5 max-w-xl">
            {Object.entries(values).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {LABEL_MAP[key] || key}
                </label>

                {DESCRIPTIONS[activeTab]?.[key] && (
                  <p className="text-xs text-gray-500 mb-1">{DESCRIPTIONS[activeTab][key]}</p>
                )}

                {isImageField(key) ? (
                  <div className="space-y-2">
                    {val ? (
                      <div className="relative inline-block">
                        <img
                          src={val}
                          alt={LABEL_MAP[key]}
                          className="w-40 h-40 object-cover rounded-lg border"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No image uploaded yet</p>
                    )}
                    <div>
                      <label className="block">
                        <span className="sr-only">Choose file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(key, e.target.files?.[0])}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                          disabled={uploading === key}
                        />
                      </label>
                      {uploading === key && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                    </div>
                  </div>
                ) : typeof val === 'boolean' ? (
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

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
