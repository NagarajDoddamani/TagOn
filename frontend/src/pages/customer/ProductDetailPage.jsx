import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/product.service'
import { uploadService } from '../../services/upload.service'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [customizationNotes, setCustomizationNotes] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState('details')

  const [recipientName, setRecipientName] = useState('')
  const [mobile, setMobile] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [landmark, setLandmark] = useState('')

  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await productService.getProduct(id)
        setProduct(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || !product) return
    const maxFiles = selectedTemplate?.max_upload_count || 5
    if (uploadedImages.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadService.uploadImage(files[i])
        setUploadedImages((prev) => [...prev, result.url])
      } catch (err) {
        console.error(err)
      }
    }
  }

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePlaceOrder = async () => {
    if (!product) return
    setSubmitting(true)
    try {
      const { orderService } = await import('../../services/order.service')
      const order = await orderService.createOrder({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        template_id: selectedTemplate?.id,
        quantity,
        delivery_address: {
          recipient_name: recipientName,
          mobile,
          address_line: addressLine,
          city,
          state,
          postal_code: postalCode,
          landmark: landmark || undefined,
        },
        customization_notes: customizationNotes || undefined,
        uploaded_images: uploadedImages.length > 0 ? uploadedImages : undefined,
      })

      if (screenshot) {
        const { paymentService } = await import('../../services/payment.service')
        await paymentService.uploadScreenshot(order.id, screenshot, transactionId || undefined)
      } else {
        navigate(`/orders/${order.id}`)
        return
      }

      navigate(`/orders`)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!product) return <p className="text-center py-12">Product not found</p>

  const price = selectedVariant ? selectedVariant.price : product.base_price
  const total = price * quantity

  return (
    <div>
      {step === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image_url || 'https://via.placeholder.com/500'}
              alt={product.name}
              loading="lazy"
              className="w-full rounded-lg shadow-md"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500'; }}
            />
          </div>
          <div>
            <span className="text-sm text-primary-600 font-semibold">{product.category?.name}</span>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <p className="mt-4 text-2xl font-bold text-primary-600">
              {formatCurrency(price)}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Select Variant</h3>
                <div className="space-y-2">
                  {product.variants.map((v) => (
                    <label key={v.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariant?.id === v.id}
                        onChange={() => setSelectedVariant(v)}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">{v.name}</span>
                        <span className="ml-2 text-gray-600">{formatCurrency(v.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="font-semibold">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="ml-3 w-20 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {(product.customizable || product.product_type === 'customized') && (
              <button
                onClick={() => setStep('customize')}
                className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
              >
                Customize & Order
              </button>
            )}
            {!product.customizable && product.product_type === 'ready_made' && (
              <button
                onClick={() => setStep('address')}
                className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
              >
                Buy Now
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'customize' && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Customize Your Product</h2>

          {product.templates.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Select Template</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {product.templates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`p-3 border rounded-md cursor-pointer text-center ${
                      selectedTemplate?.id === t.id ? 'border-primary-500 bg-primary-50' : ''
                    }`}
                  >
                    <img
                      src={t.preview_image || 'https://via.placeholder.com/150'}
                      alt={t.name}
                      loading="lazy"
                      className="w-full h-24 object-cover rounded mb-2"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                    <span className="text-sm font-medium">{t.name}</span>
                    <p className="text-xs text-gray-500">Max {t.max_upload_count} images</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Upload Images</h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt={`Upload ${i}`} loading="lazy" className="w-24 h-24 object-cover rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Customization Notes</h3>
            <textarea
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter any special instructions, gift message, printing details..."
            />
          </div>

          <button
            onClick={() => setStep('address')}
            className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
          >
            Continue to Delivery
          </button>
        </div>
      )}

      {step === 'address' && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Recipient Name</label>
                <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium">Mobile</label>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Address Line</label>
              <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium">State</label>
                <input value={state} onChange={(e) => setState(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium">Postal Code</label>
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Landmark (Optional)</label>
              <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <button
              onClick={() => setStep('payment')}
              className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Review & Payment</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <p><strong>Product:</strong> {product.name}</p>
            {selectedVariant && <p><strong>Variant:</strong> {selectedVariant.name}</p>}
            {selectedTemplate && <p><strong>Template:</strong> {selectedTemplate.name}</p>}
            <p><strong>Quantity:</strong> {quantity}</p>
            <p><strong>Total:</strong> {formatCurrency(total)}</p>
            {uploadedImages.length > 0 && <p><strong>Images:</strong> {uploadedImages.length} uploaded</p>}
            {customizationNotes && <p><strong>Notes:</strong> {customizationNotes}</p>}
            <p><strong>Deliver to:</strong> {recipientName}, {addressLine}, {city}, {state} - {postalCode}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-3">Scan & Pay</h3>
            <p className="mb-4">Scan the QR code below using any UPI app to complete payment.</p>
            <img
              src="https://res.cloudinary.com/demo/image/upload/v1/tagon/qr-code.png"
              alt="QR Code"
              loading="lazy"
              className="w-48 h-48 mx-auto mb-4"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium">Upload Payment Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                className="mt-1"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">Transaction ID (Optional)</label>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={submitting || !screenshot}
            className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  )
}
