import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminOfficeService from '../services/adminOfficeService'
import type { AdminMainOfficeDto } from '../types/office'

function SkeletonRow() {
  return (
    <tr>
      {[36, 140, 130, 160, 120, 180, 96].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Offices() {
  const [offices, setOffices] = useState<AdminMainOfficeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRef = useRef(true)
  const navigate = useNavigate()

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

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Offices</h1>
          {!loading && !error && (
            <p className="page__count">
              {offices.length} office{offices.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/offices/new')}>
          + Create Office
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
                    <th className="table__actions">Actions</th>
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
                  </tbody>
                ) : (
                  <tbody>
                    {offices.map(office => (
                      <tr key={office.id}>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && offices.length === 0 && (
              <div className="state">
                <span className="state__icon">🏢</span>
                <p className="state__title">No offices yet</p>
                <p className="state__desc">Create your first office to get started.</p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate('/offices/new')}
                >
                  + Create Office
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
