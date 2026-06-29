import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminOfficeService from '../services/adminOfficeService'
import type { AdminOfficeDetailsFullDto } from '../types/office'

type Tab = 'info' | 'branches' | 'employees' | 'vehicles' | 'drivers'

function dash(v: string | number | null | undefined) {
  return v !== null && v !== undefined && v !== ''
    ? v
    : <span className="detail-value--muted">—</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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

// ── Info tab ────────────────────────────────────────────────────────────────
function InfoTab({ info }: { info: AdminOfficeDetailsFullDto['info'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Owner card */}
      {info.owner && (
        <div className="owner-card">
          <div className="owner-card__avatar">
            {(info.owner.enName || info.owner.arName || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="owner-card__name">{info.owner.enName || info.owner.arName}</div>
            <div className="owner-card__meta">
              {info.owner.email}{info.owner.phone ? ` · ${info.owner.phone}` : ''}
            </div>
          </div>
          <span className="badge badge--primary" style={{ marginLeft: 'auto' }}>Owner</span>
        </div>
      )}

      {/* Office details grid */}
      <div className="detail-grid">
        <div className="detail-grid__item--full">
          <p className="detail-label">Office Names</p>
          <p className="detail-value">{info.enName}</p>
          <p className="detail-value" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{info.arName}</p>
        </div>

        <div>
          <p className="detail-label">Commercial Name (EN)</p>
          <p className="detail-value">{dash(info.enCROfficeName)}</p>
        </div>
        <div>
          <p className="detail-label">Commercial Name (AR)</p>
          <p className="detail-value">{dash(info.arCROfficeName)}</p>
        </div>

        <div>
          <p className="detail-label">National ID</p>
          <p className="detail-value" style={{ fontFamily: 'monospace' }}>{dash(info.officeNationalId)}</p>
        </div>
        <div>
          <p className="detail-label">Type</p>
          <p className="detail-value">
            <span className={`badge ${info.parentOfficeId ? 'badge--neutral' : 'badge--success'}`}>
              {info.parentOfficeId ? 'Branch' : 'Main Office'}
            </span>
          </p>
        </div>

        <div>
          <p className="detail-label">Email</p>
          <p className="detail-value">{dash(info.officeEmails)}</p>
        </div>
        <div>
          <p className="detail-label">Phone</p>
          <p className="detail-value">{dash(info.officePhoneNumbers)}</p>
        </div>

        <div>
          <p className="detail-label">City ID</p>
          <p className="detail-value">{dash(info.cityId)}</p>
        </div>
        <div>
          <p className="detail-label">Nationality ID</p>
          <p className="detail-value">{dash(info.nationalityId)}</p>
        </div>

        <div className="detail-grid__item--full">
          <p className="detail-label">Address</p>
          <p className="detail-value">{dash(info.addressDetails)}</p>
        </div>

        {info.coordinates && (
          <div className="detail-grid__item--full">
            <p className="detail-label">Coordinates</p>
            <p className="detail-value" style={{ fontFamily: 'monospace' }}>{info.coordinates}</p>
          </div>
        )}

        {(info.enTrademarkName || info.arTrademarkName) && (
          <>
            <div>
              <p className="detail-label">Trademark (EN)</p>
              <p className="detail-value">{dash(info.enTrademarkName)}</p>
            </div>
            <div>
              <p className="detail-label">Trademark (AR)</p>
              <p className="detail-value">{dash(info.arTrademarkName)}</p>
            </div>
          </>
        )}

        {info.trademarkPath && (
          <div className="detail-grid__item--full">
            <p className="detail-label">Trademark Image</p>
            <img
              src={info.trademarkPath}
              alt="Trademark"
              style={{ maxWidth: 160, maxHeight: 100, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain', marginTop: 6 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Branches tab ─────────────────────────────────────────────────────────────
function BranchesTab({ branches, onView }: { branches: AdminOfficeDetailsFullDto['branches']; onView: (id: number) => void }) {
  if (branches.length === 0) {
    return (
      <div className="state">
        <span className="state__icon">🏢</span>
        <p className="state__title">No branches</p>
        <p className="state__desc">This office has no branch offices.</p>
      </div>
    )
  }
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Email</th>
            <th>Phone</th>
            <th className="table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map(b => (
            <tr key={b.id}>
              <td className="table__id">#{b.id}</td>
              <td>
                <div className="cell-name-main">{b.enName}</div>
                <div className="cell-name-sub">{b.arName}</div>
              </td>
              <td>
                {b.owner ? (
                  <>
                    <div className="cell-name-main">{b.owner.enName || b.owner.arName}</div>
                    <div className="cell-name-sub">{b.owner.email}</div>
                  </>
                ) : <span className="cell-empty">—</span>}
              </td>
              <td>{dash(b.officeEmails)}</td>
              <td>{dash(b.officePhoneNumbers)}</td>
              <td className="table__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => onView(b.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Employees tab ─────────────────────────────────────────────────────────────
function EmployeesTab({ employees }: { employees: AdminOfficeDetailsFullDto['employees'] }) {
  if (employees.length === 0) {
    return (
      <div className="state">
        <span className="state__icon">👥</span>
        <p className="state__title">No employees</p>
        <p className="state__desc">No employees are assigned to this office.</p>
      </div>
    )
  }
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Title</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Since</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td className="table__id">#{e.id}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="cell-name-main">{e.enName || e.arName}</div>
                  {e.isOfficeOwner && <span className="badge badge--primary" style={{ fontSize: 10 }}>Owner</span>}
                </div>
                {e.arName && e.enName && <div className="cell-name-sub">{e.arName}</div>}
              </td>
              <td>{dash(e.title)}</td>
              <td>{dash(e.department)}</td>
              <td>{dash(e.phoneNumber)}</td>
              <td>{dash(e.jobEmail)}</td>
              <td>{formatDate(e.startingDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Vehicles tab ──────────────────────────────────────────────────────────────
function VehiclesTab({ vehicles }: { vehicles: AdminOfficeDetailsFullDto['vehicles'] }) {
  if (vehicles.length === 0) {
    return (
      <div className="state">
        <span className="state__icon">🚌</span>
        <p className="state__title">No vehicles</p>
        <p className="state__desc">No vehicles are registered to this office.</p>
      </div>
    )
  }
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle No.</th>
            <th>Owner</th>
            <th>Producer</th>
            <th>Year</th>
            <th>License Exp.</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td className="table__id">#{v.id}</td>
              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.vehicleNumber}</td>
              <td>
                <div className="cell-name-main">{v.enOwnerFullName}</div>
                {v.arOwnerFullName && <div className="cell-name-sub">{v.arOwnerFullName}</div>}
              </td>
              <td>{dash(v.producerEnName)}</td>
              <td>{dash(v.manufacturingYear)}</td>
              <td>
                <span style={{ color: new Date(v.vehicleLicenseExp) < new Date() ? 'var(--danger)' : 'inherit' }}>
                  {formatDate(v.vehicleLicenseExp)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Drivers tab ───────────────────────────────────────────────────────────────
function DriversTab({ drivers }: { drivers: AdminOfficeDetailsFullDto['drivers'] }) {
  if (drivers.length === 0) {
    return (
      <div className="state">
        <span className="state__icon">🧑‍✈️</span>
        <p className="state__title">No drivers</p>
        <p className="state__desc">No drivers are registered to this office.</p>
      </div>
    )
  }
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>License No.</th>
            <th>License Type</th>
            <th>License Exp.</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(d => (
            <tr key={d.id}>
              <td className="table__id">#{d.id}</td>
              <td>
                <div className="cell-name-main">{d.enName || d.arName}</div>
                {d.arName && d.enName && <div className="cell-name-sub">{d.arName}</div>}
              </td>
              <td>{dash(d.phoneNumber)}</td>
              <td style={{ fontFamily: 'monospace' }}>{d.licenseNumber}</td>
              <td>{dash(d.licenseTypeEnName)}</td>
              <td>
                <span style={{ color: new Date(d.licenseExpDate) < new Date() ? 'var(--danger)' : 'inherit' }}>
                  {formatDate(d.licenseExpDate)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OfficeDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<AdminOfficeDetailsFullDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('info')
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    adminOfficeService
      .getOfficeDetails(Number(id))
      .then(res => {
        if (!activeRef.current) return
        setData(res.data)
      })
      .catch(err => {
        if (!activeRef.current) return
        const e = err as { response?: { data?: { message?: string } }; message?: string }
        setError(e?.response?.data?.message || e?.message || 'Failed to load office details.')
      })
      .finally(() => {
        if (activeRef.current) setLoading(false)
      })
    return () => { activeRef.current = false }
  }, [id])

  if (loading) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/offices')}>← Back to Offices</button>
        <div className="detail-page__card" style={{ marginTop: 8 }}>
          <SectionSkeleton />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/offices')}>← Back to Offices</button>
        <div className="alert alert--error">{error || 'Office not found.'}</div>
      </div>
    )
  }

  const { info, branches, employees, vehicles, drivers } = data

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'info',      label: 'Info',      icon: '📋' },
    { key: 'branches',  label: 'Branches',  icon: '🏢', count: branches.length },
    { key: 'employees', label: 'Employees', icon: '👥', count: employees.length },
    { key: 'vehicles',  label: 'Vehicles',  icon: '🚌', count: vehicles.length },
    { key: 'drivers',   label: 'Drivers',   icon: '🧑‍✈️', count: drivers.length },
  ]

  return (
    <div>
      {/* Header */}
      <div className="detail-page__top">
        <button type="button" className="back-link" onClick={() => navigate('/offices')}>
          ← Back to Offices
        </button>
        <div className="detail-page__bar">
          <div>
            <h1 className="detail-page__title">{info.enName}</h1>
            <p className="detail-page__subtitle">
              #{info.id} · {info.parentOfficeId ? 'Branch Office' : 'Main Office'}
            </p>
          </div>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--outline-primary"
              onClick={() => navigate(`/offices/${id}/edit`)}
            >
              Edit Office
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`tab-btn${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.count !== undefined && (
              <span className="tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="detail-page__card">
        {tab === 'info'      && <InfoTab info={info} />}
        {tab === 'branches'  && <BranchesTab branches={branches} onView={bid => navigate(`/offices/${bid}`)} />}
        {tab === 'employees' && <EmployeesTab employees={employees} />}
        {tab === 'vehicles'  && <VehiclesTab vehicles={vehicles} />}
        {tab === 'drivers'   && <DriversTab drivers={drivers} />}
      </div>
    </div>
  )
}
