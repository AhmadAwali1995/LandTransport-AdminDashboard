import { useCallback, useEffect, useRef, useState } from 'react'
import lookupService from '../services/lookupService'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import type { CityDto, CountryDto } from '../types/lookup'

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.'
}

const emptyForm = { arName: '', enName: '', countryId: '' }

export default function Cities() {
  const [cities, setCities] = useState<CityDto[]>([])
  const [countries, setCountries] = useState<CountryDto[]>([])
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
      const [citiesRes, countriesRes] = await Promise.all([
        lookupService.cities.getAll(),
        lookupService.countries.getAll(),
      ])
      if (!activeRef.current) return
      setCities(citiesRes.data ?? [])
      setCountries(countriesRes.data ?? [])
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

  const countryName = (id: number) => countries.find(c => c.id === id)?.enName ?? '—'

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (city: CityDto) => {
    setForm({ arName: city.arName, enName: city.enName, countryId: String(city.countryId) })
    setEditingId(city.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { arName: form.arName, enName: form.enName, countryId: Number(form.countryId) }
      if (editingId != null) {
        await lookupService.cities.update({ ...payload, id: editingId })
        showToast('City updated.', 'success')
      } else {
        await lookupService.cities.create(payload)
        showToast('City created.', 'success')
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
      await lookupService.cities.remove(deleteId)
      showToast('City deleted.', 'success')
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
          <h1 className="page__title">Cities</h1>
          {!loading && !error && <p className="page__count">{cities.length} cities</p>}
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>+ Add City</button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load cities</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchAll}>Try again</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Arabic Name</th><th>English Name</th><th>Country</th><th className="table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '14px 16px' }}>Loading…</td></tr>
                ) : cities.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '14px 16px' }}>No cities yet.</td></tr>
                ) : (
                  cities.map(city => (
                    <tr key={city.id}>
                      <td className="table__id">#{city.id}</td>
                      <td>{city.arName}</td>
                      <td>{city.enName}</td>
                      <td>{countryName(city.countryId)}</td>
                      <td className="table__actions">
                        <div className="btn-group">
                          <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEdit(city)}>Edit</button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteId(city.id)}>Delete</button>
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
              <h2 className="modal__title">{editingId != null ? 'Edit City' : 'Add City'}</h2>
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
                  <label className="form-label">Country <span className="form-required">*</span></label>
                  <select className="form-control" value={form.countryId}
                    onChange={e => setForm(f => ({ ...f, countryId: e.target.value }))} required>
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.enName}</option>)}
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
        title="Delete City"
        description="Are you sure you want to delete this city? This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
