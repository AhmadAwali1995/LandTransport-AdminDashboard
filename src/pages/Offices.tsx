import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminOfficeService from '../services/adminOfficeService'
import type { AdminMainOfficeDto } from '../types/office'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../context/ToastContext'

function SkeletonRow() {
  return (
    <tr>
      {[36, 140, 130, 160, 120, 180, 72, 96].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Offices() {
  const [offices, setOffices] = useState<AdminMainOfficeDto[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const activeRef = useRef(true)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const fetchOffices = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminOfficeService.getOffices()
      if (!activeRef.current) return
      setOffices(res.data ?? [])
    } catch (err: unknown) {
      if (!activeRef.current) return
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setError(e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.')
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchOffices()
    return () => { activeRef.current = false }
  }, [fetchOffices])

  const toggleExpand = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      // TODO: wire up delete endpoint when available
      showToast('Office deleted.', 'success')
      setDeleteTarget(null)
      await fetchOffices()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showToast(e?.response?.data?.message || 'Delete failed.', 'error')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const totalBranches = offices.reduce((s, o) => s + o.branches.length, 0)

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Offices</h1>
          {!loading && !error && (
            <p className="page__count">
              {offices.length} main office{offices.length !== 1 ? 's' : ''} ·{' '}
              {totalBranches} branch{totalBranches !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/offices/new')}>
          + New Main Office
        </button>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load offices</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchOffices}>
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
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Branches</th>
                    <th className="table__actions">Actions</th>
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
                  </tbody>
                ) : (
                  <tbody>
                    {offices.map(office => {
                      const isOpen = expanded.has(office.id)
                      return (
                        <Fragment key={office.id}>
                          {/* Main office row */}
                          <tr>
                            <td className="table__id">#{office.id}</td>
                            <td>
                              <div className="cell-name-main">{office.enName}</div>
                              <div className="cell-name-sub">{office.arName}</div>
                            </td>
                            <td>
                              {office.owner ? (
                                <>
                                  <div className="cell-name-main">{office.owner.enName || office.owner.arName}</div>
                                  <div className="cell-name-sub">{office.owner.email}</div>
                                </>
                              ) : <span className="cell-empty">—</span>}
                            </td>
                            <td>{office.officeEmails || <span className="cell-empty">—</span>}</td>
                            <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {office.officePhoneNumbers || <span className="cell-empty">—</span>}
                            </td>
                            <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {office.addressDetails || <span className="cell-empty">—</span>}
                            </td>
                            <td>
                              {office.branches.length > 0 ? (
                                <button
                                  type="button"
                                  className="expand-btn"
                                  onClick={() => toggleExpand(office.id)}
                                >
                                  <em className={`expand-icon${isOpen ? ' expand-icon--open' : ''}`}>▼</em>
                                  {office.branches.length} branch{office.branches.length !== 1 ? 'es' : ''}
                                </button>
                              ) : (
                                <span className="badge badge--neutral">No branches</span>
                              )}
                            </td>
                            <td className="table__actions">
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn btn--ghost btn--sm"
                                  onClick={() => navigate(`/offices/${office.id}`)}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--outline-primary btn--sm"
                                  onClick={() => navigate(`/offices/${office.id}/edit`)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn--outline-danger btn--sm"
                                  onClick={() => setDeleteTarget({ id: office.id, name: office.enName })}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Branch sub-rows */}
                          {isOpen && office.branches.map(branch => (
                            <tr key={branch.id} className="table__branch-row">
                              <td className="table__id" style={{ paddingLeft: 32 }}>#{branch.id}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16 }}>
                                  <span style={{ color: 'var(--border)', fontSize: 18, lineHeight: 1 }}>└</span>
                                  <div>
                                    <div className="cell-name-main">{branch.enName}</div>
                                    <div className="cell-name-sub">{branch.arName}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {branch.owner ? (
                                  <>
                                    <div className="cell-name-main">{branch.owner.enName || branch.owner.arName}</div>
                                    <div className="cell-name-sub">{branch.owner.email}</div>
                                  </>
                                ) : <span className="cell-empty">—</span>}
                              </td>
                              <td>{branch.officeEmails || <span className="cell-empty">—</span>}</td>
                              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {branch.officePhoneNumbers || <span className="cell-empty">—</span>}
                              </td>
                              <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {branch.addressDetails || <span className="cell-empty">—</span>}
                              </td>
                              <td>
                                <span className="badge badge--neutral" style={{ fontSize: 11 }}>Branch</span>
                              </td>
                              <td className="table__actions">
                                <div className="btn-group">
                                  <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => navigate(`/offices/${branch.id}`)}
                                  >
                                    View
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--outline-primary btn--sm"
                                    onClick={() => navigate(`/offices/${branch.id}/edit`)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--outline-danger btn--sm"
                                    onClick={() => setDeleteTarget({ id: branch.id, name: branch.enName })}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )
                    })}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && offices.length === 0 && (
              <div className="state">
                <span className="state__icon">🏢</span>
                <p className="state__title">No offices yet</p>
                <p className="state__desc">Create your first main office to get started.</p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate('/offices/new')}
                >
                  + Create Main Office
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Office"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
