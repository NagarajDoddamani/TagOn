import { useToastStore } from '../../store/toast.store'

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="alert" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${typeStyles[t.type] || typeStyles.info} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-fade-in`}
        >
          <span className="text-sm">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-white/80 hover:text-white text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
