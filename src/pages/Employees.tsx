import { useCallback, useEffect, useRef, useState } from 'react'
import adminEmployeeService from '../services/adminEmployeeService'
import adminOfficeService from '../services/adminOfficeService'
import SearchableSelect from '../components/SearchableSelect'
import type { AdminEmployeeListItemDto } from '../types/employee'
import type { AdminMainOfficeDto } from '../types/office'

function SkeletonRow() {
  return (
    <tr>
      {[36, 160, 140, 130, 130, 120, 110].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Employees() {
  const [employees, setEmployees] = useState<AdminEmployeeListItemDto[]>([])
  const [offices, setOffices] = useState<AdminMainOfficeDto[]>([])
  const [titles, setTitles] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [officeId, setOfficeId] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRef = useRef(true)

  const fetchEmployees = useCallback(async (searchText: string, office: string, titleFilter: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await adminEmployeeService.getEmployees(searchText || undefined, office ? Number(office) : undefined, titleFilter || undefined)
      if (!activeRef.current) return
      setEmployees(res.data ?? [])
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
    setTitle('')
    adminEmployeeService.getEmployeeTitles(officeId ? Number(officeId) : undefined)
      .then(res => { if (activeRef.current) setTitles(res.data ?? []) })
      .catch(() => {})
  }, [officeId])

  useEffect(() => {
    const handle = setTimeout(() => fetchEmployees(search, officeId, title), 300)
    return () => clearTimeout(handle)
  }, [search, officeId, title, fetchEmployees])

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Employees</h1>
          {!loading && !error && (
            <p className="page__count">
              {employees.length} employee{employees.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone or title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '0 0 280px' }}
          />
          <select
            className="form-control"
            value={officeId}
            onChange={e => setOfficeId(e.target.value)}
            style={{ flex: '0 0 220px' }}
          >
            <option value="">All offices</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.enName}</option>
            ))}
          </select>
          <SearchableSelect
            options={titles}
            value={title}
            onChange={setTitle}
            placeholder="Search titles…"
            allLabel="All titles"
            style={{ flex: '0 0 220px' }}
          />
        </div>
      </div>

      <div className="table-wrap">
        {error ? (
          <div className="state">
            <span className="state__icon">⚠️</span>
            <p className="state__title">Failed to load employees</p>
            <p className="state__desc">{error}</p>
            <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => fetchEmployees(search, officeId, title)}>
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
                    <th>Title</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Email</th>
                  </tr>
                </thead>

                {loading ? (
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
                  </tbody>
                ) : (
                  <tbody>
                    {employees.map(employee => (
                      <tr key={employee.id}>
                        <td className="table__id">#{employee.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="cell-name-main">{employee.enName || employee.arName}</div>
                            {employee.isOfficeOwner && <span className="badge badge--primary" style={{ fontSize: 10 }}>Owner</span>}
                          </div>
                          {employee.arName && employee.enName && <div className="cell-name-sub">{employee.arName}</div>}
                        </td>
                        <td>{employee.officeEnName || <span className="cell-empty">—</span>}</td>
                        <td>{employee.title || <span className="cell-empty">—</span>}</td>
                        <td>{employee.departmentEnName || <span className="cell-empty">—</span>}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {employee.phoneNumber || <span className="cell-empty">—</span>}
                        </td>
                        <td>{employee.jobEmail || <span className="cell-empty">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {!loading && employees.length === 0 && (
              <div className="state">
                <span className="state__icon">👥</span>
                <p className="state__title">No employees found</p>
                <p className="state__desc">
                  {search || officeId || title ? 'Try a different search or filter.' : 'No employees have been added by any office yet.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
