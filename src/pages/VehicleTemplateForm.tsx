import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SeatLayoutBuilder, { countSeats, MAX_ROW_CELLS } from '../components/SeatLayoutBuilder'
import SeatLayoutPreview from '../components/SeatLayoutPreview'
import { useToast } from '../context/ToastContext'
import vehicleTemplateService, { parseTemplateRows } from '../services/vehicleTemplateService'
import type { SeatRow } from '../types/vehicleTemplate'

const emptyForm = {
  enName: '',
  arName: '',
  enDescription: '',
  arDescription: '',
}

function errorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || fallback
}

export default function VehicleTemplateForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [rows, setRows] = useState<SeatRow[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isInUse, setIsInUse] = useState(false)
  const activeRef = useRef(true)

  const seatsCount = countSeats(rows)
  const readOnly = isEdit && isInUse

  useEffect(() => {
    if (!isEdit || !id) return
    activeRef.current = true
    setLoading(true)
    setError('')
    vehicleTemplateService
      .getById(Number(id))
      .then(res => {
        if (!activeRef.current) return
        const template = res.data
        setForm({
          enName: template.enName ?? '',
          arName: template.arName ?? '',
          enDescription: template.enDescription ?? '',
          arDescription: template.arDescription ?? '',
        })
        setRows(parseTemplateRows(template.htmlContent))
        setIsInUse(Boolean(template.isInUse))
      })
      .catch(err => {
        if (!activeRef.current) return
        setError(errorMessage(err, 'Failed to load template.'))
      })
      .finally(() => {
        if (activeRef.current) setLoading(false)
      })
    return () => { activeRef.current = false }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (readOnly) return
    if (!form.enName.trim() || !form.arName.trim()) {
      setError('English and Arabic names are required.')
      return
    }
    if (seatsCount < 1) {
      setError('Add at least one seat to the layout.')
      return
    }
    if (rows.some(row => row.length > MAX_ROW_CELLS)) {
      setError(`Each line can have at most ${MAX_ROW_CELLS} elements.`)
      return
    }

    const payload = {
      enName: form.enName.trim(),
      arName: form.arName.trim(),
      enDescription: form.enDescription.trim(),
      arDescription: form.arDescription.trim(),
      rows: rows.filter(row => row.length > 0),
    }

    setSaving(true)
    try {
      const res = isEdit
        ? await vehicleTemplateService.update(Number(id), payload)
        : await vehicleTemplateService.create(payload)
      showToast(isEdit ? 'Vehicle template updated.' : 'Vehicle template created.', 'success')
      navigate(`/vehicle-templates/${res.data.id}`)
    } catch (err: unknown) {
      setError(errorMessage(err, isEdit ? 'Failed to update template.' : 'Failed to create template.'))
    } finally {
      setSaving(false)
    }
  }

  const backTo = isEdit ? `/vehicle-templates/${id}` : '/vehicle-templates'

  if (loading) {
    return (
      <div className="form-page form-page--wide">
        <button type="button" className="back-link" onClick={() => navigate('/vehicle-templates')}>
          Back to Vehicle Templates
        </button>
        <div className="form-page__card" style={{ marginTop: 8 }}>
          <div className="skeleton" style={{ height: 18, maxWidth: 240 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="form-page form-page--wide">
      <div className="form-page__top">
        <button type="button" className="back-link" onClick={() => navigate(backTo)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {isEdit ? 'Back to Template' : 'Back to Vehicle Templates'}
        </button>
        <h1 className="form-page__title">{isEdit ? 'Edit Vehicle Template' : 'New Vehicle Template'}</h1>
      </div>

      <form className="form-page__card" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert--error" role="alert">{error}</div>
        )}
        {readOnly && (
          <div className="alert alert--warning" role="status">
            This template is used by office trips, so it cannot be edited. Existing trips keep this layout.
          </div>
        )}

        <div className="form-grid">
          <p className="form-section">Names</p>
          <div className="form-group">
            <label className="form-label">English Name <span className="form-required">*</span></label>
            <input
              className="form-control"
              value={form.enName}
              maxLength={200}
              onChange={e => setForm(f => ({ ...f, enName: e.target.value }))}
              required
              disabled={readOnly}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Arabic Name <span className="form-required">*</span></label>
            <input
              className="form-control"
              value={form.arName}
              maxLength={200}
              onChange={e => setForm(f => ({ ...f, arName: e.target.value }))}
              required
              disabled={readOnly}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (EN)</label>
            <input
              className="form-control"
              value={form.enDescription}
              maxLength={200}
              onChange={e => setForm(f => ({ ...f, enDescription: e.target.value }))}
              disabled={readOnly}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (AR)</label>
            <input
              className="form-control"
              value={form.arDescription}
              maxLength={200}
              onChange={e => setForm(f => ({ ...f, arDescription: e.target.value }))}
              disabled={readOnly}
            />
          </div>

          <p className="form-section">Seat layout · {seatsCount} seats</p>
          <div className="form-group form-group--full">
            {readOnly
              ? <SeatLayoutPreview rows={rows} />
              : <SeatLayoutBuilder rows={rows} onChange={setRows} />}
          </div>
        </div>

        <div className="form-page__actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(backTo)} disabled={saving}>
            Cancel
          </button>
          {!readOnly && (
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving && <span className="btn__spinner" />}
              {isEdit ? 'Save Changes' : 'Create Template'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
