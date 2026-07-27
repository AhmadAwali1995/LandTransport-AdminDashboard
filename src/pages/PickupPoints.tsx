import { useCallback, useEffect, useRef, useState } from 'react'
import lookupService from '../services/lookupService'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import type { PickupPointDto, CityDto } from '../types/lookup'

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.'
}

function parseLocation(raw: string): { lat: string; lng: string } {
  try {
    const parsed = JSON.parse(raw)
    return { lat: String(parsed.lat ?? ''), lng: String(parsed.lng ?? '') }
  } catch {
    return { lat: '', lng: '' }
  }
}

const emptyForm = { arName: '', enName: '', cityId: '', lat: '', lng: '' }

export default function PickupPoints() {
  const [points, setPoints] = useState<PickupPointDto[]>([])
  const [cities, setCities] = useState<CityDto[]>([])
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
      const [pointsRes, citiesRes] = await Promise.all([
        lookupService.pickupPoints.getAll(),
        lookupService.cities.getAll(),
      ])
      if (!activeRef.current) return
      setPoints(pointsRes.data ?? [])
      setCities(citiesRes.data ?? [])
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

  const cityName = (id: number) => cities.find(c => c.id === id)?.enName ?? '—'

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (point: PickupPointDto) => {
    const { lat, lng } = parseLocation(point.location)
    setForm({ arName: point.arName, enName: point.enName, cityId: String(point.cityId), lat, lng })
    setEditingId(point.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        arName: form.arName,
        enName: form.enName,
        cityId: Number(form.cityId),
        location: JSON.stringify({ lat: Number(form.lat), lng: Number(form.lng) }),
      }
      if (editingId != null) {
        await lookupService.pickupPoints.update({ ...payload, id: editingId })
        showToast('Pickup point updated.', 'success')
      } else {
        await lookupService.pickupPoints.create(payload)
        showToast('Pickup point created.', 'success')
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
      await lookupService.pickupPoints.remove(deleteId)
      showToast('Pickup point deleted.', 'success')
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
          <h1 className="page__title">Pickup Points</h1>
          {!loading && !error && <p className="page__count">{points.length} pickup points</p>}
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Pickup Point</button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load pickup points</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchAll}>Try again</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Arabic Name</th><th>English Name</th><th>City</th><th>Location</th><th className="table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: '14px 16px' }}>Loading…</td></tr>
                ) : points.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '14px 16px' }}>No pickup points yet.</td></tr>
                ) : (
                  points.map(point => {
                    const { lat, lng } = parseLocation(point.location)
                    return (
                      <tr key={point.id}>
                        <td className="table__id">#{point.id}</td>
                        <td>{point.arName}</td>
                        <td>{point.enName}</td>
                        <td>{cityName(point.cityId)}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {lat && lng ? `${lat}, ${lng}` : <span className="cell-empty">—</span>}
                        </td>
                        <td className="table__actions">
                          <div className="btn-group">
                            <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEdit(point)}>Edit</button>
                            <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteId(point.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
              <h2 className="modal__title">{editingId != null ? 'Edit Pickup Point' : 'Add Pickup Point'}</h2>
              <button type="button" className="modal__close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Arabic Name <span className="form-required">*</span></label>
                  <input className="form-control" value={form.arName} maxLength={300}
                    onChange={e => setForm(f => ({ ...f, arName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">English Name <span className="form-required">*</span></label>
                  <input className="form-control" value={form.enName} maxLength={300}
                    onChange={e => setForm(f => ({ ...f, enName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">City <span className="form-required">*</span></label>
                  <select className="form-control" value={form.cityId}
                    onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))} required>
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.enName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Latitude <span className="form-required">*</span></label>
                  <input className="form-control" type="number" step="any" placeholder="e.g. 31.977081" value={form.lat}
                    onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude <span className="form-required">*</span></label>
                  <input className="form-control" type="number" step="any" placeholder="e.g. 35.8542877" value={form.lng}
                    onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} required />
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
        title="Delete Pickup Point"
        description="Are you sure you want to delete this pickup point? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
