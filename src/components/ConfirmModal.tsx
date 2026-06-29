import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Delete',
  description = 'Are you sure? This action cannot be undone.',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onCancel}>×</button>
        </div>
        <div className="modal__body">{description}</div>
        <div className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="btn__spinner" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
