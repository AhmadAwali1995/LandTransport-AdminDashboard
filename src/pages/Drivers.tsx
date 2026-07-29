import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import adminDriverService from '../services/adminDriverService'
import adminOfficeService from '../services/adminOfficeService'
import type { AdminDriverListItemDto } from '../types/driver'
import type { AdminMainOfficeDto } from '../types/office'

function SkeletonRow() {
  return (
    <tr>
      {[36, 160, 140, 120, 130, 120, 110].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<AdminDriverListItemDto[]>([])
  const [offices, setOffices] = useState<AdminMainOfficeDto[]>([])
  const [search, setSearch] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRef = useRef(true)
  const navigate = useNavigate()

  const fetchDrivers = useCallback(async (searchText: string, office: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await adminDriverService.getDrivers(searchText || undefined, office ? Number(office) : undefined)
      if (!activeRef.current) return
      setDrivers(res.data ?? [])
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
    adminOfficeService.getOffices()
      .then(res => { if (activeRef.current) setOffices(res.data ?? []) })
      .catch(() => {})
    return () => { activeRef.current = false }
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => fetchDrivers(search, officeId), 300)
    return () => clearTimeout(handle)
  }, [search, officeId, fetchDrivers])

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Drivers</h1>
          {!loading && !error && (
            <p className="page__count">
              {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone or license no.…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <select
            className="form-control"
            value={officeId}
            onChange={e => setOfficeId(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="">All offices</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.enName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load drivers</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => fetchDrivers(search, officeId)}>
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
                    <th>Office</th>
                    <th>Phone</th>
                    <th>License No.</th>
                    <th>License Type</th>
                    <th>License Exp.</th>
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
                  </tbody>
                ) : (
                  <tbody>
                    {drivers.map(driver => (
                      <tr
                        key={driver.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/drivers/${driver.id}`)}
                      >
                        <td className="table__id">#{driver.id}</td>
                        <td>
                          <div className="cell-name-main">{driver.enName || driver.arName}</div>
                          {driver.arName && driver.enName && <div className="cell-name-sub">{driver.arName}</div>}
                        </td>
                        <td>{driver.officeEnName || <span className="cell-empty">—</span>}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {driver.phoneNumber || <span className="cell-empty">—</span>}
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{driver.licenseNumber}</td>
                        <td>{driver.licenseTypeEnName || <span className="cell-empty">—</span>}</td>
                        <td>
                          <span style={{ color: new Date(driver.licenseExpDate) < new Date() ? 'var(--danger)' : 'inherit' }}>
                            {new Date(driver.licenseExpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && drivers.length === 0 && (
              <div className="state">
                <span className="state__icon">🧑‍✈️</span>
                <p className="state__title">No drivers found</p>
                <p className="state__desc">
                  {search ? 'Try a different search term.' : 'No drivers have been added by any office yet.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
