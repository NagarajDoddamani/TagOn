import { useState } from 'react'
import { adminService } from '../../services/admin.service'

const REPORT_TYPES = [
  { id: 'orders', label: 'Orders', desc: 'All orders with customer, product, status & date details' },
  { id: 'payments', label: 'Payments', desc: 'Payment records with transaction IDs and verification status' },
  { id: 'revenue', label: 'Revenue', desc: 'Daily revenue breakdown with order counts' },
  { id: 'customers', label: 'Customers', desc: 'Customer list with contact info and registration date' },
  { id: 'products', label: 'Products', desc: 'Product catalog with pricing and category details' },
]

const FORMATS = [
  { id: 'csv', label: 'CSV', icon: '📄', desc: 'Comma-separated values, opens in Excel' },
  { id: 'xlsx', label: 'Excel', icon: '📊', desc: 'Formatted spreadsheet (.xlsx)' },
  { id: 'pdf', label: 'PDF', icon: '📕', desc: 'Printable document (.pdf)' },
]

export default function AdminReports() {
  const [reportType, setReportType] = useState('orders')
  const [format, setFormat] = useState('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('')
  const [downloading, setDownloading] = useState(false)

  const showDateRange = !['products'].includes(reportType)
  const showStatus = ['orders'].includes(reportType)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const filters = {}
      if (startDate) filters.start_date = startDate
      if (endDate) filters.end_date = endDate
      if (status) filters.status = status
      await adminService.downloadReport(reportType, format, filters)
    } catch (err) {
      console.error(err)
      alert('Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-500 mt-1">Download business reports in CSV, Excel, or PDF format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left – Report type selector */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Report Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`text-left p-4 rounded-lg border-2 transition ${
                    reportType === rt.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{rt.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{rt.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            {showDateRange && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            {showStatus && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="payment_pending_verification">Payment Pending</option>
                  <option value="payment_verified">Payment Verified</option>
                  <option value="designing">Designing</option>
                  <option value="approval_pending">Approval Pending</option>
                  <option value="approved">Approved</option>
                  <option value="printing">Printing</option>
                  <option value="packing">Packing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </section>
        </div>

        {/* Right – Format & Download */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-3">Format</h2>
            <div className="space-y-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    format === f.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{f.icon}</span>
                  <span className="font-medium">{f.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5 ml-6">{f.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {downloading ? 'Generating...' : `Download ${REPORT_TYPES.find((r) => r.id === reportType)?.label} Report`}
          </button>
        </div>
      </div>
    </div>
  )
}
