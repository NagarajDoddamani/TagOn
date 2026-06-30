import { useEffect, useRef } from 'react'
import { toast } from '../../store/toast.store'

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export default function GooglePrefillButton({ mode, onPrefill }) {
  const btnRef = useRef(null)
  const initialized = useRef(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    if (initialized.current) return

    const initGIS = () => {
      if (!window.google?.accounts?.id) return
      initialized.current = true

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          const payload = decodeJwt(response.credential)
          if (!payload) {
            toast.error('Failed to read Google profile')
            return
          }
          if (mode === 'register') {
            onPrefill({
              name: payload.name || '',
              email: payload.email || '',
              avatar: payload.picture || '',
            })
            toast.success('Profile filled from Google')
          } else {
            onPrefill({ email: payload.email || '' })
            toast.success('Email filled from Google')
          }
        },
        cancel_on_tap_outside: false,
      })

      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text: mode === 'register' ? 'continue_with' : 'signin_with',
          size: 'large',
          width: btnRef.current.offsetWidth || 300,
          logo_alignment: 'left',
        })
      }
    }

    if (window.google?.accounts?.id) {
      initGIS()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGIS
    document.body.appendChild(script)

    return () => {
      // cleanup not strictly needed, script stays cached
    }
  }, [clientId, mode, onPrefill])

  if (!clientId) {
    return null
  }

  return (
    <div ref={btnRef} className="w-full flex justify-center GooglePrefillButton" />
  )
}
