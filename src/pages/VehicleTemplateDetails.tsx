import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import SeatLayoutPreview from '../components/SeatLayoutPreview'
import { useToast } from '../context/ToastContext'
import vehicleTemplateService, { parseTemplateRows } from '../services/vehicleTemplateService'
import type { VehicleTemplateDto } from '../types/vehicleTemplate'

function dash(v: string | number | null | undefined) {
  return v !== null && v !== undefined && v !== ''
    ? v
    : <span className="detail-value--muted">—</span>
}

function SectionSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[240, 180, 260, 200, 140].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 18, maxWidth: w }} />
      ))}
    </div>
  )
}

export default function VehicleTemplateDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<VehicleTemplateDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const activeRef = useRef(true)
  const { showToast } = useToast()

  useEffect(() => {
    activeRef.current = true
    setLoading(true)
    setError('')
    vehicleTemplateService
      .getById(Number(id))
      .then(res => {
        if (!activeRef.current) return
        setTemplate(res.data)
      })
      .catch(err => {
        if (!activeRef.current) return
        const e = err as { response?: { data?: { message?: string } }; message?: string }
        setError(e?.response?.data?.message || e?.message || 'Failed to load template details.')
      })
      .finally(() => {
        if (activeRef.current) setLoading(false)
      })
    return () => { activeRef.current = false }
  }, [id])

  const handleDelete = async () => {
    if (!template) return
    setDeleting(true)
    try {
      const res = await vehicleTemplateService.remove(template.id)
      showToast(
        res.data?.softDeleted
          ? 'Template archived because it is used by office trips.'
          : 'Vehicle template deleted.',
        'success',
      )
      navigate('/vehicle-templates')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showToast(e?.response?.data?.message || e?.message || 'Failed to delete template.', 'error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/vehicle-templates')}>
          ← Back to Vehicle Templates
        </button>
        <div className="detail-page__card" style={{ marginTop: 8 }}>
          <SectionSkeleton />
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/vehicle-templates')}>
          ← Back to Vehicle Templates
        </button>
        <div className="alert alert--error">{error || 'Vehicle template not found.'}</div>
      </div>
    )
  }

  const rows = parseTemplateRows(template.htmlContent)

  return (
    <div>
      <div className="detail-page__top">
        <button type="button" className="back-link" onClick={() => navigate('/vehicle-templates')}>
          ← Back to Vehicle Templates
        </button>
        <div className="detail-page__bar">
          <div>
            <h1 className="detail-page__title">{template.enName}</h1>
            <p className="detail-page__subtitle">
              #{template.id} · {template.seatsCount} seats
              {template.isInUse ? ' · In use' : ''}
            </p>
          </div>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--outline-primary"
              onClick={() => navigate(`/vehicle-templates/${template.id}/edit`)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="detail-page__card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div className="detail-grid">
            <div className="detail-grid__item--full">
              <p className="detail-label">Name</p>
              <p className="detail-value">{template.enName}</p>
              <p className="detail-value" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{template.arName}</p>
            </div>

            <div>
              <p className="detail-label">Seats Count</p>
              <p className="detail-value">{template.seatsCount}</p>
            </div>
            <div>
              <p className="detail-label">Seat Rows</p>
              <p className="detail-value">{rows.length || <span className="detail-value--muted">—</span>}</p>
            </div>

            <div>
              <p className="detail-label">Description (EN)</p>
              <p className="detail-value">{dash(template.enDescription)}</p>
            </div>
            <div>
              <p className="detail-label">Description (AR)</p>
              <p className="detail-value">{dash(template.arDescription)}</p>
            </div>
          </div>

          <div>
            <p className="detail-label">Seat Layout</p>
            {template.isInUse && (
              <p className="detail-value--muted" style={{ marginBottom: 8 }}>
                Used by office trips — layout cannot be edited.
              </p>
            )}
            <SeatLayoutPreview rows={rows} />
          </div>

          <div>
            <p className="detail-label">Seats</p>
            {template.seats.length === 0 ? (
              <p className="detail-value--muted">No seats recorded for this template.</p>
            ) : (
              <div className="table-scroll" style={{ marginTop: 8 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Position</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {template.seats.map((seat, index) => (
                      <tr key={seat.position ? `${seat.position}-${index}` : index}>
                        <td className="table__id">#{seat.id}</td>
                        <td style={{ fontFamily: 'monospace' }}>{seat.position || <span className="cell-empty">—</span>}</td>
                        <td>{seat.description || <span className="cell-empty">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Delete Vehicle Template"
        description={
          template.isInUse
            ? 'This template is used by office trips. It will be archived so those trips keep their seat layout.'
            : 'Are you sure you want to permanently delete this template?'
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
