import { NavLink, Navigate, useParams } from 'react-router-dom'
import lookupService from '../services/lookupService'
import LookupCrud, { type LookupField } from '../components/LookupCrud'
import type {
  ColorDto, AmenityDto, SpecialityDto, LicenseTypeDto, VehicleTypeDto,
  VehicleProducerDto, CurrencyDto, CountryDto, NationalityDto,
} from '../types/lookup'

// Every entity here is a flat name-only lookup (no foreign keys), so they all
// share the same generic LookupCrud table+modal instead of a page each.
const TABS = [
  { key: 'colors', label: 'Colors' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'specialities', label: 'Specialities' },
  { key: 'license-types', label: 'License Types' },
  { key: 'vehicle-types', label: 'Vehicle Types' },
  { key: 'vehicle-producers', label: 'Vehicle Producers' },
  { key: 'currencies', label: 'Currencies' },
  { key: 'countries', label: 'Countries' },
  { key: 'nationalities', label: 'Nationalities' },
]

export default function Lookups() {
  const { key } = useParams<{ key?: string }>()

  if (!key) return <Navigate to="/lookups/colors" replace />

  return (
    <div>
      <div className="tabs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(t => (
          <NavLink
            key={t.key}
            to={`/lookups/${t.key}`}
            className={({ isActive }) => `btn btn--sm ${isActive ? 'btn--primary' : 'btn--outline-primary'}`}
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {renderTab(key)}
    </div>
  )
}

function renderTab(key: string) {
  switch (key) {
    case 'colors':
      return (
        <LookupCrud<ColorDto>
          title="Color"
          api={lookupService.colors}
          fields={[
            { key: 'arName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'enName', label: 'English Name', required: true, maxLength: 100 },
          ] as LookupField<ColorDto>[]}
          emptyItem={{ arName: '', enName: '' }}
        />
      )
    case 'amenities':
      return (
        <LookupCrud<AmenityDto>
          title="Amenity"
          api={lookupService.amenities}
          fields={[
            { key: 'arName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'enName', label: 'English Name', required: true, maxLength: 100 },
            { key: 'iconKey', label: 'Icon Key', maxLength: 50 },
          ] as LookupField<AmenityDto>[]}
          emptyItem={{ arName: '', enName: '', iconKey: '' }}
        />
      )
    case 'specialities':
      return (
        <LookupCrud<SpecialityDto>
          title="Speciality"
          api={lookupService.specialities}
          fields={[
            { key: 'arName', label: 'Arabic Name', required: true, maxLength: 300 },
            { key: 'enName', label: 'English Name', required: true, maxLength: 300 },
          ] as LookupField<SpecialityDto>[]}
          emptyItem={{ arName: '', enName: '' }}
        />
      )
    case 'license-types':
      return (
        <LookupCrud<LicenseTypeDto>
          title="License Type"
          api={lookupService.licenseTypes}
          fields={[
            { key: 'licenseTypeArName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'licenseTypeEnName', label: 'English Name', required: true, maxLength: 100 },
          ] as LookupField<LicenseTypeDto>[]}
          emptyItem={{ licenseTypeArName: '', licenseTypeEnName: '' }}
        />
      )
    case 'vehicle-types':
      return (
        <LookupCrud<VehicleTypeDto>
          title="Vehicle Type"
          api={lookupService.vehicleTypes}
          fields={[
            { key: 'vehicleTypeArName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'vehicleTypeEnName', label: 'English Name', required: true, maxLength: 110 },
          ] as LookupField<VehicleTypeDto>[]}
          emptyItem={{ vehicleTypeArName: '', vehicleTypeEnName: '' }}
        />
      )
    case 'vehicle-producers':
      return (
        <LookupCrud<VehicleProducerDto>
          title="Vehicle Producer"
          api={lookupService.vehicleProducers}
          fields={[
            { key: 'producerArName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'producerEnName', label: 'English Name', required: true, maxLength: 100 },
          ] as LookupField<VehicleProducerDto>[]}
          emptyItem={{ producerArName: '', producerEnName: '' }}
        />
      )
    case 'currencies':
      return (
        <LookupCrud<CurrencyDto>
          title="Currency"
          api={lookupService.currencies}
          fields={[
            { key: 'code', label: 'ISO Code', required: true, maxLength: 3 },
            { key: 'nameAr', label: 'Arabic Name', maxLength: 100 },
            { key: 'nameEn', label: 'English Name', maxLength: 100 },
            { key: 'symbolAr', label: 'Arabic Symbol', maxLength: 20 },
            { key: 'symbolEn', label: 'English Symbol', maxLength: 20 },
          ] as LookupField<CurrencyDto>[]}
          emptyItem={{ code: '', nameAr: '', nameEn: '', symbolAr: '', symbolEn: '' }}
        />
      )
    case 'countries':
      return (
        <LookupCrud<CountryDto>
          title="Country"
          api={lookupService.countries}
          fields={[
            { key: 'arName', label: 'Arabic Name', required: true, maxLength: 300 },
            { key: 'enName', label: 'English Name', required: true, maxLength: 300 },
            { key: 'countryCode', label: 'Country Code', maxLength: 10 },
            { key: 'isoCode', label: 'ISO Code', maxLength: 3 },
          ] as LookupField<CountryDto>[]}
          emptyItem={{ arName: '', enName: '', countryCode: '', isoCode: '' }}
        />
      )
    case 'nationalities':
      return (
        <LookupCrud<NationalityDto>
          title="Nationality"
          api={lookupService.nationalities}
          fields={[
            { key: 'nationalityArName', label: 'Arabic Name', required: true, maxLength: 100 },
            { key: 'nationalityEnName', label: 'English Name', required: true, maxLength: 100 },
            { key: 'countryArName', label: 'Country (Arabic)', maxLength: 100 },
            { key: 'countryEnName', label: 'Country (English)', maxLength: 100 },
          ] as LookupField<NationalityDto>[]}
          emptyItem={{ nationalityArName: '', nationalityEnName: '', countryArName: '', countryEnName: '' }}
        />
      )
    default:
      return <Navigate to="/lookups/colors" replace />
  }
}
