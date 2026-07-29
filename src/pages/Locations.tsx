import { useCallback, useEffect, useRef, useState } from 'react'
import lookupService from '../services/lookupService'
import { useToast } from '../context/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import SearchableSelect from '../components/SearchableSelect'
import type { CountryDto, CityDto, StationDto } from '../types/lookup'

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string }
  return e?.response?.data?.message || e?.message || 'Network error — make sure the API is running.'
}

function parseLocation(raw: string): { lat: string; lng: string } {
  try {
    const parsed = JSON.parse(raw)
    return { lat: String(parsed.lat ?? ''), lng: String(parsed.lng ?? '') }
  } catch {
    return { lat: '', lng: '' }
  }
}

function googleMapsUrl(lat: string, lng: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`
}

// Ordered by precision: a place's exact pin (!3d/!4d) beats the map's
// viewport center (@lat,lng), which Google includes in "place" URLs too.
const COORD_PATTERNS = [
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/,
]

const SHORT_LINK_HOSTS = ['maps.app.goo.gl', 'goo.gl']

function isShortMapsLink(input: string): boolean {
  try {
    const url = new URL(input.trim())
    return SHORT_LINK_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}

function parseGoogleMapsLink(input: string): { lat: string; lng: string } | null {
  const value = input.trim()
  if (!value || isShortMapsLink(value)) return null
  for (const pattern of COORD_PATTERNS) {
    const match = value.match(pattern)
    if (match) return { lat: match[1], lng: match[2] }
  }
  return null
}

function CitySkeletonRow() {
  return (
    <tr>
      {[36, 160, 160, 180].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 14, width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function Locations() {
  const { showToast } = useToast()
  const activeRef = useRef(true)

  const [countries, setCountries] = useState<CountryDto[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null)
  const [cities, setCities] = useState<CityDto[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Country modal
  const [countryModalOpen, setCountryModalOpen] = useState(false)
  const [countryForm, setCountryForm] = useState({ arName: '', enName: '', countryCode: '', isoCode: '' })
  const [editingCountryId, setEditingCountryId] = useState<number | null>(null)

  // City modal
  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [cityForm, setCityForm] = useState({ arName: '', enName: '' })
  const [editingCityId, setEditingCityId] = useState<number | null>(null)

  // Pickup points modal (shows the stations table for one city)
  const [stationsCity, setStationsCity] = useState<CityDto | null>(null)
  const [points, setPoints] = useState<StationDto[]>([])
  const [pointsLoading, setPointsLoading] = useState(false)

  // Pickup point form modal (nested inside the stations modal)
  const [pointModalOpen, setPointModalOpen] = useState(false)
  const [pointForm, setPointForm] = useState({ arName: '', enName: '', mapsLink: '' })
  const [pointFormError, setPointFormError] = useState('')
  const [editingPointId, setEditingPointId] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'country' | 'city' | 'point'; id: number } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selectedCountry = countries.find(c => c.id === selectedCountryId) ?? null

  const fetchCountries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await lookupService.countries.getAll()
      if (!activeRef.current) return
      setCountries(res.data ?? [])
    } catch (err) {
      if (!activeRef.current) return
      setError(errorMessage(err))
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    fetchCountries()
    return () => { activeRef.current = false }
  }, [fetchCountries])

  const fetchCities = useCallback(async (countryId: number) => {
    setCitiesLoading(true)
    try {
      const res = await lookupService.cities.getByCountryId(countryId)
      if (!activeRef.current) return
      setCities(res.data ?? [])
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      if (activeRef.current) setCitiesLoading(false)
    }
  }, [showToast])

  const fetchPoints = useCallback(async (cityId: number) => {
    setPointsLoading(true)
    try {
      const res = await lookupService.stations.getByCityId(cityId)
      if (!activeRef.current) return
      setPoints(res.data ?? [])
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      if (activeRef.current) setPointsLoading(false)
    }
  }, [showToast])

  const selectCountryByName = (name: string) => {
    const country = countries.find(c => c.enName === name)
    if (!country) {
      setSelectedCountryId(null)
      setCities([])
      return
    }
    setSelectedCountryId(country.id)
    setCities([])
    fetchCities(country.id)
  }

  const toggleStations = (city: CityDto) => {
    if (stationsCity?.id === city.id) {
      setStationsCity(null)
      setPoints([])
      return
    }
    setStationsCity(city)
    fetchPoints(city.id)
  }
  const closeStations = () => {
    setStationsCity(null)
    setPoints([])
  }

  // --- Country CRUD ---
  const openAddCountry = () => {
    setCountryForm({ arName: '', enName: '', countryCode: '', isoCode: '' })
    setEditingCountryId(null)
    setCountryModalOpen(true)
  }
  const openEditCountry = (c: CountryDto) => {
    setCountryForm({ arName: c.arName, enName: c.enName, countryCode: c.countryCode, isoCode: c.isoCode })
    setEditingCountryId(c.id)
    setCountryModalOpen(true)
  }
  const submitCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCountryId != null) {
        await lookupService.countries.update({ ...countryForm, id: editingCountryId })
        showToast('Country updated.', 'success')
      } else {
        await lookupService.countries.create(countryForm)
        showToast('Country created.', 'success')
      }
      setCountryModalOpen(false)
      fetchCountries()
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // --- City CRUD ---
  const openAddCity = () => {
    setCityForm({ arName: '', enName: '' })
    setEditingCityId(null)
    setCityModalOpen(true)
  }
  const openEditCity = (c: CityDto) => {
    setCityForm({ arName: c.arName, enName: c.enName })
    setEditingCityId(c.id)
    setCityModalOpen(true)
  }
  const submitCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCountryId == null) return
    setSaving(true)
    try {
      const payload = { ...cityForm, countryId: selectedCountryId }
      if (editingCityId != null) {
        await lookupService.cities.update({ ...payload, id: editingCityId })
        showToast('City updated.', 'success')
      } else {
        await lookupService.cities.create(payload)
        showToast('City created.', 'success')
      }
      setCityModalOpen(false)
      fetchCities(selectedCountryId)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // --- Pickup point CRUD ---
  const openAddPoint = () => {
    setPointForm({ arName: '', enName: '', mapsLink: '' })
    setPointFormError('')
    setEditingPointId(null)
    setPointModalOpen(true)
  }
  const openEditPoint = (p: StationDto) => {
    const { lat, lng } = parseLocation(p.location)
    setPointForm({ arName: p.arName, enName: p.enName, mapsLink: lat && lng ? googleMapsUrl(lat, lng) : '' })
    setPointFormError('')
    setEditingPointId(p.id)
    setPointModalOpen(true)
  }
  const submitPoint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stationsCity == null) return
    const coords = parseGoogleMapsLink(pointForm.mapsLink)
    if (!coords) {
      setPointFormError(
        isShortMapsLink(pointForm.mapsLink)
          ? 'Shortened links (maps.app.goo.gl) can\'t be read directly — open it in a browser, then copy the full expanded URL from the address bar.'
          : 'Paste a valid Google Maps link (or "lat,lng") that includes coordinates.'
      )
      return
    }
    setPointFormError('')
    setSaving(true)
    try {
      const payload = {
        arName: pointForm.arName,
        enName: pointForm.enName,
        cityId: stationsCity.id,
        location: JSON.stringify({ lat: Number(coords.lat), lng: Number(coords.lng) }),
      }
      if (editingPointId != null) {
        await lookupService.stations.update({ ...payload, id: editingPointId })
        showToast('Pickup point updated.', 'success')
      } else {
        await lookupService.stations.create(payload)
        showToast('Pickup point created.', 'success')
      }
      setPointModalOpen(false)
      fetchPoints(stationsCity.id)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  // --- Delete ---
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === 'country') {
        await lookupService.countries.remove(deleteTarget.id)
        showToast('Country deleted.', 'success')
        if (selectedCountryId === deleteTarget.id) {
          setSelectedCountryId(null)
          setCities([])
        }
        fetchCountries()
      } else if (deleteTarget.kind === 'city') {
        await lookupService.cities.remove(deleteTarget.id)
        showToast('City deleted.', 'success')
        if (stationsCity?.id === deleteTarget.id) closeStations()
        if (selectedCountryId != null) fetchCities(selectedCountryId)
      } else {
        await lookupService.stations.remove(deleteTarget.id)
        showToast('Pickup point deleted.', 'success')
        if (stationsCity != null) fetchPoints(stationsCity.id)
      }
      setDeleteTarget(null)
    } catch (err) {
      showToast(errorMessage(err), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const deleteDescriptions: Record<string, string> = {
    country: 'Deleting this country will also affect its cities and pickup points.',
    city: 'Deleting this city will also affect its pickup points.',
    point: 'Are you sure you want to delete this pickup point?',
  }

  return (
    <div>
      <div className="page__header">
        <div className="page__heading">
          <h1 className="page__title">Locations</h1>
          <p className="page__count">Search for a country to see its cities, then show stations for a city.</p>
        </div>
      </div>

      {error ? (
        <div className="state">
          <span className="state__icon">⚠️</span>
          <p className="state__title">Failed to load countries</p>
          <p className="state__desc">{error}</p>
          <button type="button" className="btn btn--outline-primary btn--sm" onClick={fetchCountries}>Try again</button>
        </div>
      ) : (
        <>
          <div className="table-wrap" style={{ marginBottom: 20, overflow: 'visible', padding: 20 }}>
            <div className="page__header" style={{ marginBottom: 12 }}>
              <h2 className="page__title" style={{ fontSize: 16 }}>🌍 Country</h2>
              <button type="button" className="btn btn--primary btn--sm" onClick={openAddCountry}>+ Add Country</button>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <SearchableSelect
                options={countries.map(c => c.enName)}
                value={selectedCountry?.enName ?? ''}
                onChange={selectCountryByName}
                placeholder={loading ? 'Loading…' : 'Search countries…'}
                allLabel="Select a country"
                style={{ flex: '0 0 320px' }}
              />
              {selectedCountry && (
                <div className="btn-group">
                  <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEditCountry(selectedCountry)}>Edit</button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteTarget({ kind: 'country', id: selectedCountry.id })}>Delete</button>
                </div>
              )}
            </div>
          </div>

          {selectedCountryId != null && (
            <div className="table-wrap">
              <div className="page__header" style={{ marginBottom: 12 }}>
                <h2 className="page__title" style={{ fontSize: 16 }}>🏙️ Cities in {selectedCountry?.enName}</h2>
                <button type="button" className="btn btn--primary btn--sm" onClick={openAddCity}>+ Add City</button>
              </div>

              <div className="table-scroll">
                <table className="table table--centered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>English Name</th>
                      <th>Arabic Name</th>
                      <th className="table__actions">Actions</th>
                    </tr>
                  </thead>
                  {citiesLoading ? (
                    <tbody>
                      {[1, 2, 3].map(i => <CitySkeletonRow key={i} />)}
                    </tbody>
                  ) : (
                    <tbody>
                      {cities.map(city => {
                        const active = stationsCity?.id === city.id
                        return (
                          <tr key={city.id} style={active ? { background: 'var(--primary-light)' } : undefined}>
                            <td className="table__id">#{city.id}</td>
                            <td className="cell-name-main">{city.enName}</td>
                            <td>{city.arName}</td>
                            <td className="table__actions">
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className={`btn btn--sm ${active ? 'btn--primary' : 'btn--outline-primary'}`}
                                  onClick={() => toggleStations(city)}
                                >
                                  📍 {active ? 'Hide Stations' : 'Show Stations'}
                                </button>
                                <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEditCity(city)}>Edit</button>
                                <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteTarget({ kind: 'city', id: city.id })}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  )}
                </table>
              </div>

              {!citiesLoading && cities.length === 0 && (
                <div className="state">
                  <span className="state__icon">🏙️</span>
                  <p className="state__title">No cities yet</p>
                  <p className="state__desc">Add the first city for this country.</p>
                  <button type="button" className="btn btn--primary btn--sm" onClick={openAddCity}>+ Add City</button>
                </div>
              )}
            </div>
          )}

          {stationsCity && (
            <div className="table-wrap" style={{ marginTop: 20, borderTop: '3px solid var(--primary)' }}>
              <div className="page__header" style={{ marginBottom: 12 }}>
                <div className="page__heading">
                  <h2 className="page__title" style={{ fontSize: 16 }}>📍 Stations in {stationsCity.enName}</h2>
                  <p className="page__count">
                    {pointsLoading ? 'Loading…' : `${points.length} pickup point${points.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn--primary btn--sm" onClick={openAddPoint}>+ Add Pickup Point</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={closeStations}>✕ Close</button>
                </div>
              </div>

              {pointsLoading ? (
                <div className="table-scroll">
                  <table className="table">
                    <tbody>
                      {[1, 2, 3].map(i => <CitySkeletonRow key={i} />)}
                    </tbody>
                  </table>
                </div>
              ) : points.length === 0 ? (
                <div className="state">
                  <span className="state__icon">📍</span>
                  <p className="state__title">No pickup points yet</p>
                  <p className="state__desc">Add the first pickup point for {stationsCity.enName}.</p>
                  <button type="button" className="btn btn--primary btn--sm" onClick={openAddPoint}>+ Add Pickup Point</button>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="table table--centered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>English Name</th>
                        <th>Arabic Name</th>
                        <th>Location</th>
                        <th className="table__actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {points.map(p => {
                        const { lat, lng } = parseLocation(p.location)
                        return (
                          <tr key={p.id}>
                            <td className="table__id">#{p.id}</td>
                            <td className="cell-name-main">{p.enName}</td>
                            <td>{p.arName}</td>
                            <td>
                              <a
                                href={googleMapsUrl(lat, lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  fontSize: 12,
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  background: 'var(--primary-light)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--primary)',
                                  textDecoration: 'none',
                                  fontWeight: 500,
                                }}
                              >
                                📍 View on Map
                              </a>
                            </td>
                            <td className="table__actions">
                              <div className="btn-group">
                                <button type="button" className="btn btn--outline-primary btn--sm" onClick={() => openEditPoint(p)}>Edit</button>
                                <button type="button" className="btn btn--danger btn--sm" onClick={() => setDeleteTarget({ kind: 'point', id: p.id })}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {countryModalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setCountryModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingCountryId != null ? 'Edit Country' : 'Add Country'}</h2>
              <button type="button" className="modal__close" onClick={() => setCountryModalOpen(false)}>×</button>
            </div>
            <form onSubmit={submitCountry}>
              <div className="modal__body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">English Name <span className="form-required">*</span></label>
                    <input className="form-control" maxLength={300} value={countryForm.enName}
                      onChange={e => setCountryForm(f => ({ ...f, enName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arabic Name <span className="form-required">*</span></label>
                    <input className="form-control" dir="rtl" maxLength={300} value={countryForm.arName}
                      onChange={e => setCountryForm(f => ({ ...f, arName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country Code</label>
                    <input className="form-control" maxLength={10} placeholder="e.g. +962" value={countryForm.countryCode}
                      onChange={e => setCountryForm(f => ({ ...f, countryCode: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISO Code</label>
                    <input className="form-control" maxLength={3} placeholder="e.g. JO" value={countryForm.isoCode}
                      onChange={e => setCountryForm(f => ({ ...f, isoCode: e.target.value.toUpperCase() }))} />
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setCountryModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving && <span className="btn__spinner" />}Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cityModalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setCityModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingCityId != null ? 'Edit City' : 'Add City'}</h2>
              <button type="button" className="modal__close" onClick={() => setCityModalOpen(false)}>×</button>
            </div>
            <form onSubmit={submitCity}>
              <div className="modal__body">
                {selectedCountry && (
                  <p className="form-hint" style={{ marginTop: -4, marginBottom: 16 }}>
                    In <strong>{selectedCountry.enName}</strong>
                  </p>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">English Name <span className="form-required">*</span></label>
                    <input className="form-control" maxLength={300} value={cityForm.enName}
                      onChange={e => setCityForm(f => ({ ...f, enName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arabic Name <span className="form-required">*</span></label>
                    <input className="form-control" dir="rtl" maxLength={300} value={cityForm.arName}
                      onChange={e => setCityForm(f => ({ ...f, arName: e.target.value }))} required />
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setCityModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving && <span className="btn__spinner" />}Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pointModalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setPointModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{editingPointId != null ? 'Edit Pickup Point' : 'Add Pickup Point'}</h2>
              <button type="button" className="modal__close" onClick={() => setPointModalOpen(false)}>×</button>
            </div>
            <form onSubmit={submitPoint}>
              <div className="modal__body">
                {stationsCity && (
                  <p className="form-hint" style={{ marginTop: -4, marginBottom: 16 }}>
                    In <strong>{stationsCity.enName}</strong>
                  </p>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">English Name <span className="form-required">*</span></label>
                    <input className="form-control" maxLength={300} value={pointForm.enName}
                      onChange={e => setPointForm(f => ({ ...f, enName: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arabic Name <span className="form-required">*</span></label>
                    <input className="form-control" dir="rtl" maxLength={300} value={pointForm.arName}
                      onChange={e => setPointForm(f => ({ ...f, arName: e.target.value }))} required />
                  </div>
                  <div className="form-group form-group--full">
                    <label className="form-label">Google Maps Link <span className="form-required">*</span></label>
                    <input
                      className={`form-control${pointFormError ? ' form-control--error' : ''}`}
                      type="text"
                      placeholder="Paste a Google Maps link, e.g. https://maps.google.com/?q=31.977081,35.8542877"
                      value={pointForm.mapsLink}
                      onChange={e => { setPointForm(f => ({ ...f, mapsLink: e.target.value })); setPointFormError('') }}
                      required
                    />
                    {pointFormError ? (
                      <span className="form-error-text">{pointFormError}</span>
                    ) : (
                      (() => {
                        if (isShortMapsLink(pointForm.mapsLink)) {
                          return (
                            <span className="form-error-text">
                              Shortened links can't be read directly — open it in a browser and paste the full expanded URL instead.
                            </span>
                          )
                        }
                        const coords = parseGoogleMapsLink(pointForm.mapsLink)
                        return coords ? (
                          <span className="form-hint">Detected coordinates: {coords.lat}, {coords.lng}</span>
                        ) : (
                          <span className="form-hint">Open the location in Google Maps, then copy the page link here.</span>
                        )
                      })()
                    )}
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setPointModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving && <span className="btn__spinner" />}Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget != null}
        title="Delete"
        description={deleteTarget ? deleteDescriptions[deleteTarget.kind] : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
