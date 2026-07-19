import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminDriverService from '../services/adminDriverService'
import type { AdminDriverDetailsDto } from '../types/driver'

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

export default function DriverDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [driver, setDriver] = useState<AdminDriverDetailsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    adminDriverService
      .getDriverById(Number(id))
      .then(res => {
        if (!activeRef.current) return
        setDriver(res.data)
      })
      .catch(err => {
        if (!activeRef.current) return
        const e = err as { response?: { data?: { message?: string } }; message?: string }
        setError(e?.response?.data?.message || e?.message || 'Failed to load driver details.')
      })
      .finally(() => {
        if (activeRef.current) setLoading(false)
      })
    return () => { activeRef.current = false }
  }, [id])

  if (loading) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/drivers')}>← Back to Drivers</button>
        <div className="detail-page__card" style={{ marginTop: 8 }}>
          <SectionSkeleton />
        </div>
      </div>
    )
  }

  if (error || !driver) {
    return (
      <div>
        <button type="button" className="back-link" onClick={() => navigate('/drivers')}>← Back to Drivers</button>
        <div className="alert alert--error">{error || 'Driver not found.'}</div>
      </div>
    )
  }

  const isExpired = new Date(driver.licenseExpDate) < new Date()

  return (
    <div>
      <div className="detail-page__top">
        <button type="button" className="back-link" onClick={() => navigate('/drivers')}>
          ← Back to Drivers
        </button>
        <div className="detail-page__bar">
          <div>
            <h1 className="detail-page__title">{driver.enName || driver.arName}</h1>
            <p className="detail-page__subtitle">
              #{driver.id} · {driver.officeEnName ?? 'Unknown office'}
            </p>
          </div>
        </div>
      </div>

      <div className="detail-page__card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Driver card */}
          <div className="owner-card">
            <div className="owner-card__avatar">
              {(driver.enName || driver.arName || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="owner-card__name">{driver.enName || driver.arName}</div>
              <div className="owner-card__meta">
                {driver.email}{driver.phoneNumber ? ` · ${driver.phoneNumber}` : ''}
              </div>
            </div>
            <span className={`badge ${isExpired ? 'badge--danger' : 'badge--success'}`} style={{ marginLeft: 'auto' }}>
              {isExpired ? 'License Expired' : 'License Active'}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-grid__item--full">
              <p className="detail-label">Name</p>
              <p className="detail-value">{driver.enName}</p>
              <p className="detail-value" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{driver.arName}</p>
            </div>

            <div>
              <p className="detail-label">Office</p>
              <p className="detail-value">{dash(driver.officeEnName)}</p>
            </div>
            <div>
              <p className="detail-label">National ID</p>
              <p className="detail-value" style={{ fontFamily: 'monospace' }}>{dash(driver.nationalId)}</p>
            </div>

            <div>
              <p className="detail-label">Phone</p>
              <p className="detail-value">{dash(driver.phoneNumber)}</p>
            </div>
            <div>
              <p className="detail-label">WhatsApp</p>
              <p className="detail-value">{dash(driver.whatsappPhoneNumber)}</p>
            </div>

            <div>
              <p className="detail-label">Email</p>
              <p className="detail-value">{dash(driver.email)}</p>
            </div>
            <div>
              <p className="detail-label">Nationality</p>
              <p className="detail-value">{dash(driver.nationalityEnName)}</p>
            </div>

            <div className="detail-grid__item--full">
              <p className="detail-label">Address</p>
              <p className="detail-value">{dash(driver.address)}</p>
            </div>

            <div>
              <p className="detail-label">License Number</p>
              <p className="detail-value" style={{ fontFamily: 'monospace' }}>{driver.licenseNumber}</p>
            </div>
            <div>
              <p className="detail-label">License Type</p>
              <p className="detail-value">{dash(driver.licenseTypeEnName)}</p>
            </div>

            <div>
              <p className="detail-label">License Issued</p>
              <p className="detail-value">{formatDate(driver.licenseDate)}</p>
            </div>
            <div>
              <p className="detail-label">License Expires</p>
              <p className="detail-value">
                <span style={{ color: isExpired ? 'var(--danger)' : 'inherit' }}>
                  {formatDate(driver.licenseExpDate)}
                </span>
              </p>
            </div>

            <div>
              <p className="detail-label">License Country</p>
              <p className="detail-value">{dash(driver.licenseCountryEnName)}</p>
            </div>

            {driver.profilePhotoUrl && (
              <div>
                <p className="detail-label">Profile Photo</p>
                <img
                  src={driver.profilePhotoUrl}
                  alt="Profile"
                  style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover', marginTop: 6 }}
                />
              </div>
            )}

            {driver.licensePhotoUrl && (
              <div>
                <p className="detail-label">License Photo</p>
                <img
                  src={driver.licensePhotoUrl}
                  alt="License"
                  style={{ maxWidth: 220, maxHeight: 140, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'contain', marginTop: 6 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
