import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../context/ToastContext'
import vehicleTemplateService from '../services/vehicleTemplateService'
import type { VehicleTemplateDto } from '../types/vehicleTemplate'

function SkeletonRow() {
  return (
    <tr>
      {[36, 160, 80, 220, 72].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

function errorMessage(err: unknown, fallback = 'Failed to load vehicle templates.'): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || fallback
}

export default function VehicleTemplates() {
  const [templates, setTemplates] = useState<VehicleTemplateDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const activeRef = useRef(true)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await vehicleTemplateService.getAll()
      if (!activeRef.current) return
      setTemplates(res.data ?? [])
    } catch (err: unknown) {
      if (!activeRef.current) return
      setError(errorMessage(err))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchTemplates()
    return () => { activeRef.current = false }
  }, [fetchTemplates])

  const deleteTarget = templates.find(t => t.id === deleteId)
  const handleDelete = async () => {
    if (deleteId == null) return
    setDeleting(true)
    try {
      const res = await vehicleTemplateService.remove(deleteId)
      showToast(
        res.data?.softDeleted
          ? 'Template archived because it is used by office trips.'
          : 'Vehicle template deleted.',
        'success',
      )
      setDeleteId(null)
      await fetchTemplates()
    } catch (err: unknown) {
      showToast(errorMessage(err, 'Failed to delete template.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Vehicle Templates</h1>
          {!loading && !error && (
            <p className="page__count">
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/vehicle-templates/new')}>
          + Add Template
        </button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load vehicle templates</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchTemplates}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Seats</th>
                    <th>Description</th>
                    <th className="table__actions">Actions</th>
                  </tr>
                </thead>
                {loading ? (
                  <tbody>
                    {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                  </tbody>
                ) : (
                  <tbody>
                    {templates.map(template => (
                      <tr
                        key={template.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/vehicle-templates/${template.id}`)}
                      >
                        <td className="table__id">#{template.id}</td>
                        <td>
                          <div className="cell-name-main">{template.enName}</div>
                          <div className="cell-name-sub">{template.arName}</div>
                        </td>
                        <td>
                          <span className="badge badge--primary">{template.seatsCount}</span>
                        </td>
                        <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {template.enDescription || template.arDescription || <span className="cell-empty">—</span>}
                        </td>
                        <td className="table__actions">
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={e => {
                              e.stopPropagation()
                              navigate(`/vehicle-templates/${template.id}`)
                            }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn--outline-primary btn--sm"
                            onClick={e => {
                              e.stopPropagation()
                              navigate(`/vehicle-templates/${template.id}/edit`)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={e => {
                              e.stopPropagation()
                              setDeleteId(template.id)
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && templates.length === 0 && (
              <div className="state">
                <span className="state__icon">🚌</span>
                <p className="state__title">No vehicle templates yet</p>
                <p className="state__desc">Seat layout templates will appear here once they are added.</p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate('/vehicle-templates/new')}
                >
                  + Add Template
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteId != null}
        title="Delete Vehicle Template"
        description={
          deleteTarget?.isInUse
            ? 'This template is used by office trips. It will be archived so those trips keep their seat layout.'
            : 'Are you sure you want to permanently delete this template?'
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
