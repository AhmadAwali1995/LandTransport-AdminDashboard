import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminOfficeService from '../services/adminOfficeService'
import { useToast } from '../context/ToastContext'

interface OfficeFields {
  enOfficeName: string
  arOfficeName: string
  enOfficeCommercialName: string
  arOfficeCommercialName: string
  officeNationalId: string
  officeEmails: string
  officePhoneNumbers: string
  cityId: string
  addressDetails: string
  coordinates: string
  nationalityId: string
  enTrademarkName: string
  arTrademarkName: string
  trademarkPath: string
}

interface AdminUserFields {
  enName: string
  arName: string
  email: string
  phoneNumber: string
}

const emptyOffice: OfficeFields = {
  enOfficeName: '', arOfficeName: '',
  enOfficeCommercialName: '', arOfficeCommercialName: '',
  officeNationalId: '', officeEmails: '', officePhoneNumbers: '',
  cityId: '', addressDetails: '', coordinates: '',
  nationalityId: '', enTrademarkName: '', arTrademarkName: '', trademarkPath: '',
}

const emptyAdmin: AdminUserFields = { enName: '', arName: '', email: '', phoneNumber: '' }

interface CreateResult {
  officeId: number
  adminUserId: string
  adminEmail: string
  adminPassword: string
}

export default function OfficeForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [office, setOffice] = useState<OfficeFields>(emptyOffice)
  const [adminUser, setAdminUser] = useState<AdminUserFields>(emptyAdmin)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [created, setCreated] = useState<CreateResult | null>(null)
  const activeRef = useRef(true)

  useEffect(() => {
    if (!isEdit) return
    activeRef.current = true
    adminOfficeService
      .getOfficeById(Number(id))
      .then(res => {
        if (!activeRef.current) return
        const d = res.data
        setOffice({
          enOfficeName: d.enName,
          arOfficeName: d.arName,
          enOfficeCommercialName: d.enCROfficeName,
          arOfficeCommercialName: d.arCROfficeName,
          officeNationalId: d.officeNationalId,
          officeEmails: d.officeEmails,
          officePhoneNumbers: d.officePhoneNumbers,
          cityId: String(d.cityId),
          addressDetails: d.addressDetails,
          coordinates: d.coordinates ?? '',
          nationalityId: String(d.nationalityId),
          enTrademarkName: d.enTrademarkName ?? '',
          arTrademarkName: d.arTrademarkName ?? '',
          trademarkPath: d.trademarkPath ?? '',
        })
      })
      .catch(err => {
        if (!activeRef.current) return
        const e = err as { response?: { data?: { message?: string } }; message?: string }
        setLoadError(e?.response?.data?.message || e?.message || 'Failed to load office data.')
      })
      .finally(() => {
        if (activeRef.current) setLoading(false)
      })

    return () => { activeRef.current = false }
  }, [id, isEdit])

  const setO = (field: keyof OfficeFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setOffice(prev => ({ ...prev, [field]: e.target.value }))

  const setA = (field: keyof AdminUserFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAdminUser(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      if (isEdit) {
        await adminOfficeService.editOffice(Number(id), {
          enOfficeName: office.enOfficeName,
          arOfficeName: office.arOfficeName,
          enOfficeCommercialName: office.enOfficeCommercialName,
          arOfficeCommercialName: office.arOfficeCommercialName,
          officeNationalId: office.officeNationalId,
          officeEmails: office.officeEmails,
          officePhoneNumbers: office.officePhoneNumbers,
          cityId: Number(office.cityId),
          addressDetails: office.addressDetails,
          coordinates: office.coordinates || null,
          nationalityId: Number(office.nationalityId),
          enTrademarkName: office.enTrademarkName,
          arTrademarkName: office.arTrademarkName,
          trademarkPath: office.trademarkPath || null,
        })
        showToast('Office updated successfully.', 'success')
        navigate('/offices')
      } else {
        const res = await adminOfficeService.createMainOffice({
          office: {
            enOfficeName: office.enOfficeName,
            arOfficeName: office.arOfficeName,
            enOfficeCommercialName: office.enOfficeCommercialName,
            arOfficeCommercialName: office.arOfficeCommercialName,
            officeNationalId: office.officeNationalId,
            officeEmails: office.officeEmails,
            officePhoneNumbers: office.officePhoneNumbers,
            cityId: Number(office.cityId),
            countryId: 1,
            addressDetails: office.addressDetails,
            coordinates: office.coordinates || null,
            nationalityId: Number(office.nationalityId),
            enTrademarkName: office.enTrademarkName,
            arTrademarkName: office.arTrademarkName,
            trademarkPath: office.trademarkPath || null,
          },
          adminUser: {
            enName: adminUser.enName,
            arName: adminUser.arName,
            email: adminUser.email,
            phoneNumber: adminUser.phoneNumber,
          },
        })
        const data = (res as { data: CreateResult }).data
        setCreated(data)
        showToast('Main office created successfully.', 'success')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: string[] } }; message?: string }
      const msg = e?.response?.data?.errors?.[0] || e?.response?.data?.message || e?.message || 'Something went wrong.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="form-page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '40px 0' }}>
          {[300, 200, 250, 180, 220].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 40, maxWidth: w }} />
          ))}
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="form-page">
        <div className="alert alert--error">{loadError}</div>
        <button type="button" className="btn btn--ghost" onClick={() => navigate('/offices')}>
          ← Back to Offices
        </button>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-page__top">
        <button type="button" className="back-link" onClick={() => navigate('/offices')}>
          ← Back to Offices
        </button>
        <h1 className="form-page__title">
          {isEdit ? 'Edit Office' : 'New Main Office'}
        </h1>
        <p className="form-page__subtitle">
          {isEdit
            ? 'Update office information below.'
            : 'Fill in the details to create a new main office and its admin account.'}
        </p>
      </div>

      {/* Created credentials card */}
      {created && (
        <div className="success-card">
          <p className="success-card__title">✓ Main Office Created</p>
          <div className="success-card__row">
            <span className="success-card__label">Office ID</span>
            <span className="success-card__value">#{created.officeId}</span>
          </div>
          <div className="success-card__row">
            <span className="success-card__label">Admin Email</span>
            <span className="success-card__value">{created.adminEmail}</span>
          </div>
          <div className="success-card__row">
            <span className="success-card__label">Admin Password</span>
            <span className="success-card__value">{created.adminPassword}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 12 }}>
            Save the password — it will not be shown again.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-page__card">
          {submitError && <div className="alert alert--error">{submitError}</div>}

          <div className="form-grid">
            {/* ── Office Information ── */}
            <div className="form-section">Office Information</div>

            <div className="form-group">
              <label className="form-label">English Name <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Al Aqaba Transport Office"
                value={office.enOfficeName}
                onChange={setO('enOfficeName')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Arabic Name <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                dir="rtl"
                placeholder="مثال: مكتب العقبة للنقل"
                value={office.arOfficeName}
                onChange={setO('arOfficeName')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Commercial Name (EN) <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="Commercial register name"
                value={office.enOfficeCommercialName}
                onChange={setO('enOfficeCommercialName')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Commercial Name (AR) <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                dir="rtl"
                placeholder="الاسم التجاري"
                value={office.arOfficeCommercialName}
                onChange={setO('arOfficeCommercialName')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">National ID <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. 123456789012"
                value={office.officeNationalId}
                onChange={setO('officeNationalId')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="email"
                placeholder="office@example.com"
                value={office.officeEmails}
                onChange={setO('officeEmails')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="tel"
                placeholder="+962 7x xxx xxxx"
                value={office.officePhoneNumbers}
                onChange={setO('officePhoneNumbers')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City ID <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="number"
                min={1}
                placeholder="City ID"
                value={office.cityId}
                onChange={setO('cityId')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nationality ID <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="number"
                min={1}
                placeholder="Nationality ID"
                value={office.nationalityId}
                onChange={setO('nationalityId')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Coordinates</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. 29.5265, 35.0000"
                value={office.coordinates}
                onChange={setO('coordinates')}
              />
              <span className="form-hint">Optional GPS coordinates (lat, lng)</span>
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Address <span className="form-required">*</span></label>
              <textarea
                className="form-control"
                placeholder="Full address details"
                value={office.addressDetails}
                onChange={setO('addressDetails')}
                required
              />
            </div>

            {/* ── Trademark ── */}
            <div className="form-section">Trademark</div>

            <div className="form-group">
              <label className="form-label">Trademark Name (EN) <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="Trademark name in English"
                value={office.enTrademarkName}
                onChange={setO('enTrademarkName')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trademark Name (AR) <span className="form-required">*</span></label>
              <input
                className="form-control"
                type="text"
                dir="rtl"
                placeholder="اسم العلامة التجارية"
                value={office.arTrademarkName}
                onChange={setO('arTrademarkName')}
                required
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Trademark Image URL</label>
              <input
                className="form-control"
                type="text"
                placeholder="https://..."
                value={office.trademarkPath}
                onChange={setO('trademarkPath')}
              />
            </div>

            {/* ── Admin User (create only) ── */}
            {!isEdit && (
              <>
                <div className="form-section">Admin User Account</div>

                <div className="form-group">
                  <label className="form-label">Full Name (EN) <span className="form-required">*</span></label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="e.g. Ahmad Al-Awali"
                    value={adminUser.enName}
                    onChange={setA('enName')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name (AR) <span className="form-required">*</span></label>
                  <input
                    className="form-control"
                    type="text"
                    dir="rtl"
                    placeholder="مثال: أحمد العوالي"
                    value={adminUser.arName}
                    onChange={setA('arName')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Email <span className="form-required">*</span></label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="admin@example.com"
                    value={adminUser.email}
                    onChange={setA('email')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Phone <span className="form-required">*</span></label>
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="+962 7x xxx xxxx"
                    value={adminUser.phoneNumber}
                    onChange={setA('phoneNumber')}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-page__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate('/offices')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting && <span className="btn__spinner" />}
              {isEdit ? 'Save Changes' : 'Create Office'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
