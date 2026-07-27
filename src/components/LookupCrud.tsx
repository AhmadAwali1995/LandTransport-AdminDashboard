import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import ConfirmModal from './ConfirmModal'

export interface LookupField<T> {
  key: keyof T
  label: string
  required?: boolean
  maxLength?: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LookupApi<T> {
  getAll: () => Promise<ApiResponse<T[]>>
  create: (payload: Partial<T>) => Promise<ApiResponse<number>>
  update: (payload: Partial<T>) => Promise<ApiResponse<null>>
  remove: (id: number) => Promise<ApiResponse<null>>
}

interface Props<T extends { id: number }> {
  title: string
  api: LookupApi<T>
  fields: LookupField<T>[]
  emptyItem: Partial<T>
}

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.'
}

export default function LookupCrud<T extends { id: number }>({ title, api, fields, emptyItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Partial<T>>(emptyItem)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const activeRef = useRef(true)
  const { showToast } = useToast()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getAll()
      if (!activeRef.current) return
      setItems(res.data ?? [])
    } catch (err: unknown) {
      if (!activeRef.current) return
      setError(errorMessage(err))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [api])

  useEffect(() => {
    activeRef.current = true
    fetchAll()
    return () => { activeRef.current = false }
  }, [fetchAll])

  const openCreate = () => {
    setForm(emptyItem)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (item: T) => {
    setForm(item)
    setEditingId(item.id)
    setModalOpen(true)
  }

  const setField = (key: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId != null) {
        await api.update({ ...form, id: editingId } as Partial<T>)
        showToast(`${title} updated.`, 'success')
      } else {
        await api.create(form)
        showToast(`${title} created.`, 'success')
      }
      setModalOpen(false)
      fetchAll()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    setDeleting(true)
    try {
      await api.remove(deleteId)
      showToast(`${title} deleted.`, 'success')
      setDeleteId(null)
      fetchAll()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">{title}</h1>
          {!loading && !error && (
            <p className="page__count">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + Add {title}
        </button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load {title.toLowerCase()}</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchAll}>
              Try again
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  {fields.map(f => <th key={String(f.key)}>{f.label}</th>)}
                  <th className="table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={fields.length + 2} style={{ padding: '14px 16px' }}>Loading…</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={fields.length + 2} style={{ padding: '14px 16px' }}>No records yet.</td></tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id}>
                      <td className="table__id">#{item.id}</td>
                      {fields.map(f => (
                        <td key={String(f.key)}>{String(item[f.key] ?? '') || <span className="cell-empty">—</span>}</td>
                      ))}
                      <td className="table__actions">
                        <div className="btn-group">
                          <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEdit(item)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteId(item.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingId != null ? `Edit ${title}` : `Add ${title}`}</h2>
              <button type="button" className="modal__close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                {fields.map(f => (
                  <div className="form-group" key={String(f.key)}>
                    <label className="form-label">
                      {f.label} {f.required && <span className="form-required">*</span>}
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      maxLength={f.maxLength}
                      value={String(form[f.key] ?? '')}
                      onChange={setField(f.key)}
                      required={f.required}
                    />
                  </div>
                ))}
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving && <span className="btn__spinner" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId != null}
        title={`Delete ${title}`}
        description="Are you sure you want to delete this item? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
