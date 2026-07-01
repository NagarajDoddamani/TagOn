import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { toast } from '../../store/toast.store'
import { productService } from '../../services/product.service'
import { templateGroupService } from '../../services/template-group.service'
import { paymentService } from '../../services/payment.service'
import { uploadService } from '../../services/upload.service'
import { addressService } from '../../services/address.service'
import { formatCurrency, NO_IMAGE_FALLBACK } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const CUSTOMIZABLE_STEPS = [
  { key: 'details', label: 'Details' },
  { key: 'templates', label: 'Select Design' },
  { key: 'customize', label: 'Customize' },
  { key: 'address', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
]

const SIMPLE_STEPS = [
  { key: 'details', label: 'Details' },
  { key: 'address', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
]

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
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

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [saveAddress, setSaveAddress] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const [effectiveTemplates, setEffectiveTemplates] = useState([])
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const data = await productService.getProduct(id)
        setProduct(data)
      } catch {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!product) return
    if (product.template_group_id) {
      templateGroupService.getGroupTemplates(product.template_group_id)
        .then(setEffectiveTemplates)
        .catch(() => setEffectiveTemplates(product.templates || []))
    } else {
      setEffectiveTemplates(product.templates || [])
    }
  }, [product])

  useEffect(() => {
    paymentService.getQRCode().then(d => setQrUrl(d.qr_image_url || '')).catch(() => {})
  }, [])

  useEffect(() => {
    const pendingStep = sessionStorage.getItem(`order_step_${id}`)
    if (pendingStep) {
      setStep(pendingStep)
      sessionStorage.removeItem(`order_step_${id}`)
    }
  }, [id])

  useEffect(() => {
    if (isAuthenticated && user) {
      setRecipientName(user.name || '')
      setMobile(user.phone || '')
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && step === 'address') {
      loadSavedAddresses()
    }
  }, [isAuthenticated, step])

  const loadSavedAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const addresses = await addressService.getAddresses()
      setSavedAddresses(addresses)
      if (addresses.length > 0 && !selectedAddressId) {
        const defaultAddr = addresses.find(a => a.is_default) || addresses[0]
        selectAddress(defaultAddr)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingAddresses(false)
    }
  }

  const selectAddress = (address) => {
    setSelectedAddressId(address.id)
    setRecipientName(address.recipient_name)
    setMobile(address.mobile)
    setAddressLine(address.address_line)
    setCity(address.city)
    setState(address.state)
    setPostalCode(address.postal_code)
    setLandmark(address.landmark || '')
  }

  const clearAddressForm = () => {
    setSelectedAddressId(null)
    setAddressLine('')
    setCity('')
    setState('')
    setPostalCode('')
    setLandmark('')
    if (user) {
      setRecipientName(user.name || '')
      setMobile(user.phone || '')
    }
  }

  const requireAuth = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem(`order_step_${id}`, step)
      navigate(`/login?redirect=/products/${id}`)
      return false
    }
    return true
  }

  const handleImageUpload = async (e) => {
    if (!requireAuth()) return
    const files = e.target.files
    if (!files || !product) return
    const maxFiles = selectedTemplate?.max_upload_count || 100
    if (uploadedImages.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadService.uploadImage(files[i])
        setUploadedImages((prev) => [...prev, result.url])
        toast.success('Image uploaded')
      } catch {
        toast.error('Failed to upload image')
      }
    }
  }

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const advanceStep = (next) => {
    if (!requireAuth()) return

    if (next === 'templates' && step === 'details') {
      if (product.variants && product.variants.length > 0 && !selectedVariant) {
        toast.error('Please select a variant')
        return
      }
    }

    if (next === 'customize' && step === 'templates') {
      if (effectiveTemplates.length > 0 && !selectedTemplate) {
        toast.error('Please select a design template')
        return
      }
    }

    if (next === 'address' && step === 'customize') {
      // Customization is optional - images and notes are not required
    }

    if (next === 'payment' && step === 'address') {
      if (!recipientName.trim() || !mobile.trim() || !addressLine.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
        toast.error('Please fill in all required address fields')
        return
      }
    }

    setStep(next)
  }

  const handlePlaceOrder = async () => {
    if (!requireAuth()) return
    if (!product) return
    if (!screenshot) {
      toast.error('Please upload a payment screenshot')
      return
    }
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

      if (saveAddress && !selectedAddressId) {
        try {
          await addressService.createAddress({
            recipient_name: recipientName,
            mobile,
            address_line: addressLine,
            city,
            state,
            postal_code: postalCode,
            landmark: landmark || undefined,
          })
        } catch {
          // silently fail - address save is not critical
        }
      }

      const { paymentService } = await import('../../services/payment.service')
      await paymentService.uploadScreenshot(order.id, screenshot, transactionId || undefined)

      toast.success('Order placed successfully!')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!product) return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">Product not found</p>
    </div>
  )

  const isCustomizable = product.customizable || effectiveTemplates.length > 0
  const STEPS = isCustomizable ? CUSTOMIZABLE_STEPS : SIMPLE_STEPS
  const price = selectedVariant ? selectedVariant.price : product.base_price
  const total = price * quantity
  const stepIndex = STEPS.findIndex(s => s.key === step)

  const StepButton = ({ next, label, primary }) => (
    <div className="flex gap-3 mt-6">
      {stepIndex > 0 && (
        <button
          onClick={() => setStep(STEPS[stepIndex - 1].key)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          &larr; Back
        </button>
      )}
      <button
        onClick={() => advanceStep(next)}
        className={`flex-1 ${primary ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-6 py-3 rounded-md transition-colors`}
      >
        {label}
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const isActive = s.key === step
            const isPast = stepIndex > i
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPast ? 'bg-green-500 text-white' :
                    isActive ? 'bg-primary-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isPast ? '\u2713' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-primary-600 font-semibold' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${stepIndex > i ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* STEP 1: Product Details */}
      {step === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image_url || NO_IMAGE_FALLBACK}
              alt={product.name}
              loading="lazy"
              className="w-full rounded-lg shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-semibold">
                  {product.category.name}
                </span>
              )}
              {isCustomizable && (
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  Customizable
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <p className="mt-2 text-sm text-gray-500">{product.product_type === 'customized' ? 'Customized Product' : 'Ready-Made Product'}</p>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <p className="mt-4 text-2xl font-bold text-primary-600">
              {formatCurrency(price)}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Select Variant <span className="text-red-500">*</span></h3>
                <div className="space-y-2">
                  {product.variants.map((v) => (
                    <label key={v.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:border-primary-500 transition-colors">
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

            <StepButton
              next={isCustomizable ? 'templates' : 'address'}
              label={isCustomizable ? 'Choose Design' : 'Buy Now'}
              primary
            />
          </div>
        </div>
      )}

      {/* STEP 2: Template Selection (only for customizable products) */}
      {step === 'templates' && isCustomizable && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Select a Design Template</h2>
          <p className="text-gray-500 mb-6">Choose a template for your {product.category?.name || 'product'}. You will upload your images in the next step.</p>

          {effectiveTemplates.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {effectiveTemplates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                    selectedTemplate?.id === t.id
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  {t.images && t.images.length > 0 ? (
                    t.images.length === 1 ? (
                      <img
                        src={t.images[0].image_url}
                        alt={t.name}
                        loading="lazy"
                        className="w-full h-32 object-cover rounded mb-2"
                        onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1 mb-2">
                        {t.images.slice(0, 4).map((img) => (
                          <img
                            key={img.id}
                            src={img.image_url}
                            alt=""
                            loading="lazy"
                            className="w-full h-16 object-cover rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <img
                      src={NO_IMAGE_FALLBACK}
                      alt={t.name}
                      className="w-full h-32 object-cover rounded mb-2 opacity-50"
                    />
                  )}
                  <span className="text-sm font-semibold">{t.name}</span>
                  <p className="text-xs text-gray-500 mt-1">Up to {t.max_upload_count} images</p>
                  {selectedTemplate?.id === t.id && (
                    <span className="inline-block mt-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No templates available for this product.</p>
            </div>
          )}

          <StepButton next="customize" label="Continue to Upload" primary />
        </div>
      )}

      {/* STEP 3: Upload Images + Customization Notes (only for customizable products) */}
      {step === 'customize' && isCustomizable && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Customize Your {product.category?.name || 'Product'}</h2>
          <p className="text-gray-500 mb-6">Upload your images and add a customization message.</p>

          {selectedTemplate && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center gap-4">
              {selectedTemplate.images && selectedTemplate.images.length > 0 && (
                <img
                  src={selectedTemplate.images[0].image_url}
                  alt={selectedTemplate.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
                />
              )}
              <div>
                <p className="font-semibold">Selected Template: {selectedTemplate.name}</p>
                <p className="text-sm text-gray-500">Maximum {selectedTemplate.max_upload_count} images allowed</p>
              </div>
              <button
                onClick={() => setStep('templates')}
                className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Change
              </button>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Upload Your Images</h3>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              className="mb-3"
              aria-label="Upload images"
            />
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Upload ${i}`} loading="lazy" className="w-24 h-24 object-cover rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      aria-label={`Remove image ${i + 1}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Customization Message</h3>
            <input
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder='e.g. "Happy Birthday Rahul"'
              aria-label="Customization message"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Additional Notes (Optional)</h3>
            <textarea
              value={customizationNotes}
              onChange={(e) => setCustomizationNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any special instructions, printing details..."
              aria-label="Additional notes"
            />
          </div>

          <StepButton next="address" label="Continue to Delivery" primary />
        </div>
      )}

      {/* STEP 4: Delivery Address */}
      {step === 'address' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Delivery Address</h2>

          {savedAddresses.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Saved Addresses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => selectAddress(addr)}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedAddressId === addr.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{addr.recipient_name}</p>
                        <p className="text-sm text-gray-600">{addr.mobile}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.address_line}, {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                        {addr.landmark && (
                          <p className="text-xs text-gray-400 mt-1">Landmark: {addr.landmark}</p>
                        )}
                      </div>
                      {addr.is_default && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={clearAddressForm}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Use a new address
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name <span className="text-red-500">*</span></label>
                <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile <span className="text-red-500">*</span></label>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="Phone number" type="tel" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address Line <span className="text-red-500">*</span></label>
              <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="Street address, apartment, etc." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
                <input value={city} onChange={(e) => setCity(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
                <input value={state} onChange={(e) => setState(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code <span className="text-red-500">*</span></label>
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="w-full px-3 py-2 border rounded-md" placeholder="PIN code" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
              <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Nearby landmark" />
            </div>

            {!selectedAddressId && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Save this address for future orders</span>
              </label>
            )}

            <StepButton next="payment" label="Continue to Payment" primary />
          </div>
        </div>
      )}

      {/* STEP 5: Payment + Order Summary */}
      {step === 'payment' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Review & Payment</h2>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="flex gap-4 mb-4">
              <img
                src={product.image_url || NO_IMAGE_FALLBACK}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => { e.target.onerror = null; e.target.src = NO_IMAGE_FALLBACK; }}
              />
              <div>
                <p className="font-bold text-lg">{product.name}</p>
                {product.category && <p className="text-sm text-primary-600">{product.category.name}</p>}
                <p className="text-sm text-gray-500">{product.product_type === 'customized' ? 'Customized' : 'Ready-Made'}</p>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              {selectedVariant && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Variant:</span>
                  <span className="font-medium">{selectedVariant.name}</span>
                </div>
              )}
              {selectedTemplate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Template:</span>
                  <span className="font-medium">{selectedTemplate.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              {uploadedImages.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded Images:</span>
                  <span className="font-medium">{uploadedImages.length}</span>
                </div>
              )}
              {customizationNotes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customization:</span>
                  <span className="font-medium text-right max-w-[250px] truncate">{customizationNotes}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-2">Delivery To</h3>
            <p className="text-gray-600 text-sm">
              <strong>{recipientName}</strong><br />
              {addressLine}<br />
              {city}, {state} - {postalCode}
              {landmark && <><br />Landmark: {landmark}</>}
              <br />Phone: {mobile}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-3">Scan & Pay</h3>
            <p className="text-sm text-gray-600 mb-4">
              Scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm) to complete payment.
            </p>
            <img
              src={qrUrl || "https://res.cloudinary.com/demo/image/upload/v1/tagon/qr-code.png"}
              alt="QR Code for UPI payment"
              loading="lazy"
              className="w-48 h-48 mx-auto mb-4"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Upload Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                After making payment, take a screenshot and upload it here for verification.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                className="mt-1"
                required
                aria-label="Upload payment screenshot"
              />
              {screenshot && <p className="text-xs text-green-600 mt-1">File selected: {screenshot.name}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Transaction ID (Optional)</label>
              <input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="UPI transaction reference ID"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(STEPS[stepIndex - 1].key)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              &larr; Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !screenshot}
              className="flex-1 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
