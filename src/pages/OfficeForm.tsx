import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminOfficeService from '../services/adminOfficeService'
import lookupService from '../services/lookupService'
import { useToast } from '../context/ToastContext'
import { translateApiErrors } from '../utils/apiErrors'
import {
  validateOfficeForm,
  type OfficeFields,
  type OwnerUserFields,
} from '../utils/officeValidation'
import type { CityDto, CountryDto, CurrencyDto, NationalityDto } from '../types/lookup'

const emptyOffice: OfficeFields = {
  enOfficeName: '', arOfficeName: '',
  enOfficeCommercialName: '', arOfficeCommercialName: '', subdomain: '',
  officeNationalId: '', officeEmails: '', officePhoneNumbers: '',
  cityId: '', addressDetails: '', coordinates: '',
  nationalityId: '', currencyId: '',
  enTrademarkName: '', arTrademarkName: '', trademarkPath: '',
}

const emptyOwner: OwnerUserFields = {
  firstName: '', midName: '', lastName: '',
  email: '', phoneNumber: '', whatsappPhoneNumber: '',
  nationalId: '', nationalityId: '', birthDate: '', address: '',
}

interface CreateResult {
  officeId: number
  adminUserId: string
  adminEmail: string
  adminPassword: string
}

type FieldErrors = Record<string, string>

function controlClass(error?: string) {
  return error ? 'form-control form-control--error' : 'form-control'
}

export default function OfficeForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [office, setOffice] = useState<OfficeFields>(emptyOffice)
  const [ownerUser, setOwnerUser] = useState<OwnerUserFields>(emptyOwner)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [created, setCreated] = useState<CreateResult | null>(null)
  const [resetLink, setResetLink] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [nationalities, setNationalities] = useState<NationalityDto[]>([])
  const [countries, setCountries] = useState<CountryDto[]>([])
  const [cities, setCities] = useState<CityDto[]>([])
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([])
  const [countryId, setCountryId] = useState('')
  const activeRef = useRef(true)

  useEffect(() => {
    lookupService.getNationalities()
      .then(res => { if (activeRef.current) setNationalities(res.data ?? []) })
      .catch(() => {})
    lookupService.getCountries()
      .then(res => { if (activeRef.current) setCountries(res.data ?? []) })
      .catch(() => {})
    lookupService.getCities()
      .then(res => { if (activeRef.current) setCities(res.data ?? []) })
      .catch(() => {})
    lookupService.currencies.getAll()
      .then(res => { if (activeRef.current) setCurrencies(res.data ?? []) })
      .catch(() => {})
  }, [])

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
          subdomain: d.subdomain,
          officeNationalId: d.officeNationalId,
          officeEmails: d.officeEmails,
          officePhoneNumbers: d.officePhoneNumbers,
          cityId: String(d.cityId),
          addressDetails: d.addressDetails,
          coordinates: d.coordinates ?? '',
          nationalityId: String(d.nationalityId),
          currencyId: d.currencyId ? String(d.currencyId) : '',
          enTrademarkName: d.enTrademarkName ?? '',
          arTrademarkName: d.arTrademarkName ?? '',
          trademarkPath: d.trademarkPath ?? '',
        })
        if (d.owner) {
          setOwnerUser({
            firstName: d.owner.firstName,
            midName: d.owner.midName ?? '',
            lastName: d.owner.lastName,
            email: d.owner.email,
            phoneNumber: d.owner.phoneNumber ?? '',
            whatsappPhoneNumber: d.owner.whatsappPhoneNumber ?? '',
            nationalId: d.owner.nationalId ?? '',
            nationalityId: d.owner.nationalityId ? String(d.owner.nationalityId) : '',
            birthDate: d.owner.birthDate ? d.owner.birthDate.slice(0, 10) : '',
            address: d.owner.address ?? '',
          })
        }
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

  useEffect(() => {
    if (countryId || !office.cityId || cities.length === 0) return
    const city = cities.find(c => String(c.id) === office.cityId)
    if (city) setCountryId(String(city.countryId))
  }, [cities, office.cityId, countryId])

  const citiesForCountry = countryId
    ? cities.filter(c => String(c.countryId) === countryId)
    : []

  const clearFieldError = (name: string) => {
    setFieldErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev))
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryId(e.target.value)
    setOffice(prev => ({ ...prev, cityId: '' }))
    clearFieldError('countryId')
    clearFieldError('cityId')
  }

  const handleResetPassword = async () => {
    if (!isEdit) return
    setResettingPassword(true)
    setResetLink('')
    try {
      const res = await adminOfficeService.resetOwnerPassword(Number(id))
      setResetLink(res.data.resetLink)
      showToast('Password reset link generated.', 'success')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      showToast(e?.response?.data?.message || e?.message || 'Failed to generate reset link.', 'error')
    } finally {
      setResettingPassword(false)
    }
  }

  const setO = (field: keyof OfficeFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setOffice(prev => ({ ...prev, [field]: e.target.value }))
    clearFieldError(field)
  }

  const setU = (field: keyof OwnerUserFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setOwnerUser(prev => ({ ...prev, [field]: e.target.value }))
    clearFieldError(field)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const errs = validateOfficeForm(office, ownerUser, { countryId, isEdit })
    setFieldErrors(errs)
    if (Object.values(errs).some(Boolean)) {
      setSubmitError('Please fix the highlighted fields.')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await adminOfficeService.editOffice(Number(id), {
          enOfficeName: office.enOfficeName,
          arOfficeName: office.arOfficeName,
          enOfficeCommercialName: office.enOfficeCommercialName,
          arOfficeCommercialName: office.arOfficeCommercialName,
          subdomain: office.subdomain,
          officeNationalId: office.officeNationalId,
          officeEmails: office.officeEmails,
          officePhoneNumbers: office.officePhoneNumbers,
          cityId: Number(office.cityId),
          addressDetails: office.addressDetails,
          coordinates: office.coordinates || null,
          nationalityId: Number(office.nationalityId),
          currencyId: Number(office.currencyId),
          enTrademarkName: office.enTrademarkName,
          arTrademarkName: office.arTrademarkName,
          trademarkPath: office.trademarkPath || null,
          owner: {
            firstName: ownerUser.firstName,
            midName: ownerUser.midName || null,
            lastName: ownerUser.lastName,
            phoneNumber: ownerUser.phoneNumber,
            whatsappPhoneNumber: ownerUser.whatsappPhoneNumber || null,
            nationalId: ownerUser.nationalId || null,
            nationalityId: ownerUser.nationalityId ? Number(ownerUser.nationalityId) : null,
            birthDate: ownerUser.birthDate || null,
            address: ownerUser.address || null,
          },
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
            subdomain: office.subdomain,
            officeNationalId: office.officeNationalId,
            officeEmails: office.officeEmails,
            officePhoneNumbers: office.officePhoneNumbers,
            cityId: Number(office.cityId),
            countryId: Number(countryId),
            addressDetails: office.addressDetails,
            coordinates: office.coordinates || null,
            nationalityId: Number(office.nationalityId),
            currencyId: Number(office.currencyId),
            enTrademarkName: office.enTrademarkName,
            arTrademarkName: office.arTrademarkName,
            trademarkPath: office.trademarkPath || null,
          },
          adminUser: {
            firstName: ownerUser.firstName,
            midName: ownerUser.midName || null,
            lastName: ownerUser.lastName,
            email: ownerUser.email,
            phoneNumber: ownerUser.phoneNumber,
            whatsappPhoneNumber: ownerUser.whatsappPhoneNumber || null,
            nationalId: ownerUser.nationalId || null,
            nationalityId: ownerUser.nationalityId ? Number(ownerUser.nationalityId) : null,
            birthDate: ownerUser.birthDate || null,
            address: ownerUser.address || null,
          },
        })
        const data = (res as { data: CreateResult }).data
        setCreated(data)
        showToast('Main office created successfully.', 'success')
      }
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: {
            message?: string
            title?: string
            errors?: Record<string, string[]> | string[]
          }
        }
        message?: string
      }
      const data = e?.response?.data
      if (data?.errors && !Array.isArray(data.errors) && typeof data.errors === 'object') {
        const { fieldErrors: apiFieldErrors, summary } = translateApiErrors(data.errors)
        setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }))
        setSubmitError(summary || data.message || data.title || 'Validation failed.')
      } else {
        const msg =
          (Array.isArray(data?.errors) ? data?.errors[0] : undefined)
          || data?.message
          || data?.title
          || e?.message
          || 'Something went wrong.'
        setSubmitError(msg)
      }
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
        <button type="button" className="back-link" onClick={() => navigate('/offices')}>
          ← Back to Offices
        </button>
        <div className="alert alert--error">{loadError}</div>
      </div>
    )
  }

  return (
    <div className="form-page">
      <button type="button" className="back-link" onClick={() => navigate('/offices')}>
        ← Back to Offices
      </button>

      <div className="form-page__header">
        <h1 className="form-page__title">{isEdit ? 'Edit Office' : 'Create Office'}</h1>
        <p className="form-page__subtitle">
          {isEdit
            ? 'Update office and owner information below.'
            : 'Fill in the details to create a new office and its owner account.'}
        </p>
      </div>

      {created && (
        <div className="success-card">
          <p className="success-card__title">✓ Office Created</p>
          <div className="success-card__row">
            <span className="success-card__label">Office ID</span>
            <span className="success-card__value">#{created.officeId}</span>
          </div>
          <div className="success-card__row">
            <span className="success-card__label">Owner Email</span>
            <span className="success-card__value">{created.adminEmail}</span>
          </div>
          <div className="success-card__row">
            <span className="success-card__label">Owner Password</span>
            <span className="success-card__value">{created.adminPassword}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 12 }}>
            Save the password — it will not be shown again.
          </p>
        </div>
      )}

      {resetLink && (
        <div className="success-card">
          <p className="success-card__title">✓ Password Reset Link Generated</p>
          <p style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 13, color: 'var(--text)' }}>{resetLink}</p>
          <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 12 }}>
            No email service is configured yet — share this link with the owner manually.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-page__card">
          {submitError && <div className="alert alert--error">{submitError}</div>}

          <div className="form-grid">
            <div className="form-section">Office Information</div>

            <div className="form-group">
              <label className="form-label">English Name <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.enOfficeName)}
                type="text"
                placeholder="e.g. Al Aqaba Transport Office"
                value={office.enOfficeName}
                onChange={setO('enOfficeName')}
              />
              {fieldErrors.enOfficeName && <span className="form-error-text">{fieldErrors.enOfficeName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Arabic Name <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.arOfficeName)}
                type="text"
                dir="rtl"
                placeholder="مثال: مكتب العقبة للنقل"
                value={office.arOfficeName}
                onChange={setO('arOfficeName')}
              />
              {fieldErrors.arOfficeName && <span className="form-error-text">{fieldErrors.arOfficeName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Commercial Name (EN) <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.enOfficeCommercialName)}
                type="text"
                placeholder="Commercial register name"
                value={office.enOfficeCommercialName}
                onChange={setO('enOfficeCommercialName')}
              />
              {fieldErrors.enOfficeCommercialName && <span className="form-error-text">{fieldErrors.enOfficeCommercialName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Commercial Name (AR) <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.arOfficeCommercialName)}
                type="text"
                dir="rtl"
                placeholder="الاسم التجاري"
                value={office.arOfficeCommercialName}
                onChange={setO('arOfficeCommercialName')}
              />
              {fieldErrors.arOfficeCommercialName && <span className="form-error-text">{fieldErrors.arOfficeCommercialName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Subdomain <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.subdomain)}
                type="text"
                placeholder="e.g. al-aqaba-transport"
                value={office.subdomain}
                onChange={setO('subdomain')}
              />
              {fieldErrors.subdomain
                ? <span className="form-error-text">{fieldErrors.subdomain}</span>
                : <span className="form-hint">Lowercase letters, numbers and hyphens only</span>}
            </div>

            <div className="form-group">
              <label className="form-label">National ID <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.officeNationalId)}
                type="text"
                placeholder="e.g. 123456789012"
                value={office.officeNationalId}
                onChange={setO('officeNationalId')}
              />
              {fieldErrors.officeNationalId && <span className="form-error-text">{fieldErrors.officeNationalId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.officeEmails)}
                type="email"
                placeholder="office@example.com"
                value={office.officeEmails}
                onChange={setO('officeEmails')}
              />
              {fieldErrors.officeEmails && <span className="form-error-text">{fieldErrors.officeEmails}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.officePhoneNumbers)}
                type="tel"
                placeholder="+9627xxxxxxx"
                value={office.officePhoneNumbers}
                onChange={setO('officePhoneNumbers')}
              />
              {fieldErrors.officePhoneNumbers && <span className="form-error-text">{fieldErrors.officePhoneNumbers}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Country <span className="form-required">*</span></label>
              <select
                className={controlClass(fieldErrors.countryId)}
                value={countryId}
                onChange={handleCountryChange}
              >
                <option value="">Select country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.enName}</option>
                ))}
              </select>
              {fieldErrors.countryId && <span className="form-error-text">{fieldErrors.countryId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">City <span className="form-required">*</span></label>
              <select
                className={controlClass(fieldErrors.cityId)}
                value={office.cityId}
                onChange={setO('cityId')}
                disabled={!countryId}
              >
                <option value="">{countryId ? 'Select city' : 'Select a country first'}</option>
                {citiesForCountry.map(c => (
                  <option key={c.id} value={c.id}>{c.enName}</option>
                ))}
              </select>
              {fieldErrors.cityId && <span className="form-error-text">{fieldErrors.cityId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Nationality <span className="form-required">*</span></label>
              <select
                className={controlClass(fieldErrors.nationalityId)}
                value={office.nationalityId}
                onChange={setO('nationalityId')}
              >
                <option value="">Select nationality</option>
                {nationalities.map(n => (
                  <option key={n.id} value={n.id}>{n.nationalityEnName}</option>
                ))}
              </select>
              {fieldErrors.nationalityId && <span className="form-error-text">{fieldErrors.nationalityId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Currency <span className="form-required">*</span></label>
              <select
                className={controlClass(fieldErrors.currencyId)}
                value={office.currencyId}
                onChange={setO('currencyId')}
              >
                <option value="">Select currency</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.nameEn} ({c.symbolEn})
                  </option>
                ))}
              </select>
              {fieldErrors.currencyId && <span className="form-error-text">{fieldErrors.currencyId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Coordinates</label>
              <input
                className={controlClass(fieldErrors.coordinates)}
                type="text"
                placeholder="e.g. 29.5265, 35.0000"
                value={office.coordinates}
                onChange={setO('coordinates')}
              />
              {fieldErrors.coordinates
                ? <span className="form-error-text">{fieldErrors.coordinates}</span>
                : <span className="form-hint">Optional GPS coordinates (lat, lng)</span>}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Address <span className="form-required">*</span></label>
              <textarea
                className={controlClass(fieldErrors.addressDetails)}
                placeholder="Full office address"
                value={office.addressDetails}
                onChange={setO('addressDetails')}
              />
              {fieldErrors.addressDetails && <span className="form-error-text">{fieldErrors.addressDetails}</span>}
            </div>

            <div className="form-section">Trademark</div>

            <div className="form-group">
              <label className="form-label">Trademark Name (EN) <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.enTrademarkName)}
                type="text"
                placeholder="Trademark name in English"
                value={office.enTrademarkName}
                onChange={setO('enTrademarkName')}
              />
              {fieldErrors.enTrademarkName && <span className="form-error-text">{fieldErrors.enTrademarkName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Trademark Name (AR) <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.arTrademarkName)}
                type="text"
                dir="rtl"
                placeholder="اسم العلامة التجارية"
                value={office.arTrademarkName}
                onChange={setO('arTrademarkName')}
              />
              {fieldErrors.arTrademarkName && <span className="form-error-text">{fieldErrors.arTrademarkName}</span>}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Trademark Image URL</label>
              <input
                className={controlClass(fieldErrors.trademarkPath)}
                type="text"
                placeholder="https://..."
                value={office.trademarkPath}
                onChange={setO('trademarkPath')}
              />
              {fieldErrors.trademarkPath && <span className="form-error-text">{fieldErrors.trademarkPath}</span>}
            </div>

            <div className="form-section">
              Owner User Account
              {isEdit && (
                <button
                  type="button"
                  className="btn btn--outline-primary btn--sm"
                  style={{ float: 'right', textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword && <span className="btn__spinner" />}
                  Reset Password
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">First Name <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.firstName)}
                type="text"
                placeholder="e.g. Ahmad"
                value={ownerUser.firstName}
                onChange={setU('firstName')}
              />
              {fieldErrors.firstName && <span className="form-error-text">{fieldErrors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                className={controlClass(fieldErrors.midName)}
                type="text"
                placeholder="e.g. Khalid"
                value={ownerUser.midName}
                onChange={setU('midName')}
              />
              {fieldErrors.midName && <span className="form-error-text">{fieldErrors.midName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.lastName)}
                type="text"
                placeholder="e.g. Al-Awali"
                value={ownerUser.lastName}
                onChange={setU('lastName')}
              />
              {fieldErrors.lastName && <span className="form-error-text">{fieldErrors.lastName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.email)}
                type="email"
                placeholder="owner@example.com"
                value={ownerUser.email}
                onChange={setU('email')}
                disabled={isEdit}
              />
              {fieldErrors.email
                ? <span className="form-error-text">{fieldErrors.email}</span>
                : isEdit && <span className="form-hint">Email cannot be changed</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span className="form-required">*</span></label>
              <input
                className={controlClass(fieldErrors.phoneNumber)}
                type="tel"
                placeholder="+9627xxxxxxx"
                value={ownerUser.phoneNumber}
                onChange={setU('phoneNumber')}
              />
              {fieldErrors.phoneNumber && <span className="form-error-text">{fieldErrors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Phone</label>
              <input
                className={controlClass(fieldErrors.whatsappPhoneNumber)}
                type="tel"
                placeholder="+9627xxxxxxx"
                value={ownerUser.whatsappPhoneNumber}
                onChange={setU('whatsappPhoneNumber')}
              />
              {fieldErrors.whatsappPhoneNumber
                ? <span className="form-error-text">{fieldErrors.whatsappPhoneNumber}</span>
                : <span className="form-hint">Leave blank to use the same phone number</span>}
            </div>

            <div className="form-group">
              <label className="form-label">National ID</label>
              <input
                className={controlClass(fieldErrors.nationalId)}
                type="text"
                placeholder="e.g. 9876543210"
                value={ownerUser.nationalId}
                onChange={setU('nationalId')}
              />
              {fieldErrors.nationalId && <span className="form-error-text">{fieldErrors.nationalId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Nationality</label>
              <select
                className="form-control"
                value={ownerUser.nationalityId}
                onChange={setU('nationalityId')}
              >
                <option value="">Inherit from office</option>
                {nationalities.map(n => (
                  <option key={n.id} value={n.id}>{n.nationalityEnName}</option>
                ))}
              </select>
              <span className="form-hint">Leave blank to inherit from office</span>
            </div>

            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input
                className="form-control"
                type="date"
                value={ownerUser.birthDate}
                onChange={setU('birthDate')}
              />
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">Address</label>
              <textarea
                className={controlClass(fieldErrors.address)}
                placeholder="Owner's home address"
                value={ownerUser.address}
                onChange={setU('address')}
              />
              {fieldErrors.address && <span className="form-error-text">{fieldErrors.address}</span>}
            </div>
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
