import { useCallback, useEffect, useRef, useState } from 'react'
import lookupService from '../services/lookupService'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import type { VehicleModelDto, VehicleProducerDto } from '../types/lookup'

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.'
}

const emptyForm = { modelArName: '', modelEnName: '', vehicleProducerId: '' }

export default function VehicleModels() {
  const [models, setModels] = useState<VehicleModelDto[]>([])
  const [producers, setProducers] = useState<VehicleProducerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
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
      const [modelsRes, producersRes] = await Promise.all([
        lookupService.vehicleModels.getAll(),
        lookupService.vehicleProducers.getAll(),
      ])
      if (!activeRef.current) return
      setModels(modelsRes.data ?? [])
      setProducers(producersRes.data ?? [])
    } catch (err) {
      if (!activeRef.current) return
      setError(errorMessage(err))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchAll()
    return () => { activeRef.current = false }
  }, [fetchAll])

  const producerName = (id: number) => producers.find(p => p.id === id)?.producerEnName ?? '—'

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (model: VehicleModelDto) => {
    setForm({
      modelArName: model.modelArName,
      modelEnName: model.modelEnName,
      vehicleProducerId: String(model.vehicleProducerId),
    })
    setEditingId(model.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        modelArName: form.modelArName,
        modelEnName: form.modelEnName,
        vehicleProducerId: Number(form.vehicleProducerId),
      }
      if (editingId != null) {
        await lookupService.vehicleModels.update({ ...payload, id: editingId })
        showToast('Vehicle model updated.', 'success')
      } else {
        await lookupService.vehicleModels.create(payload)
        showToast('Vehicle model created.', 'success')
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
      await lookupService.vehicleModels.remove(deleteId)
      showToast('Vehicle model deleted.', 'success')
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
          <h1 className="page__title">Vehicle Models</h1>
          {!loading && !error && <p className="page__count">{models.length} models</p>}
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Model</button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load vehicle models</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchAll}>Try again</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Arabic Name</th><th>English Name</th><th>Producer</th><th className="table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '14px 16px' }}>Loading…</td></tr>
                ) : models.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '14px 16px' }}>No vehicle models yet.</td></tr>
                ) : (
                  models.map(model => (
                    <tr key={model.id}>
                      <td className="table__id">#{model.id}</td>
                      <td>{model.modelArName}</td>
                      <td>{model.modelEnName}</td>
                      <td>{producerName(model.vehicleProducerId)}</td>
                      <td className="table__actions">
                        <div className="btn-group">
                          <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEdit(model)}>Edit</button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteId(model.id)}>Delete</button>
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
              <h2 className="modal__title">{editingId != null ? 'Edit Vehicle Model' : 'Add Vehicle Model'}</h2>
              <button type="button" className="modal__close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Arabic Name <span className="form-required">*</span></label>
                  <input className="form-control" value={form.modelArName} maxLength={100}
                    onChange={e => setForm(f => ({ ...f, modelArName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">English Name <span className="form-required">*</span></label>
                  <input className="form-control" value={form.modelEnName} maxLength={100}
                    onChange={e => setForm(f => ({ ...f, modelEnName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Producer <span className="form-required">*</span></label>
                  <select className="form-control" value={form.vehicleProducerId}
                    onChange={e => setForm(f => ({ ...f, vehicleProducerId: e.target.value }))} required>
                    <option value="">Select producer</option>
                    {producers.map(p => <option key={p.id} value={p.id}>{p.producerEnName}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
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
        title="Delete Vehicle Model"
        description="Are you sure you want to delete this vehicle model? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
