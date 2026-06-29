import { useToast } from '../context/ToastContext'

const ICONS = { success: '✓', error: '✕', info: 'i' }

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">{ICONS[t.type]}</span>
          <span className="toast__message">{t.message}</span>
          <button type="button" className="toast__close" onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
