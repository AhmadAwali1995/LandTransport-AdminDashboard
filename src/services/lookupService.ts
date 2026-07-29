import apiClient from './api'
import type {
  CityDto, CountryDto, NationalityDto, ColorDto, AmenityDto, SpecialityDto,
  LicenseTypeDto, VehicleTypeDto, VehicleProducerDto, CurrencyDto, VehicleModelDto, StationDto,
} from '../types/lookup'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

// Every Look*Controller in the API follows the same Create/Update/Delete/GetAll/GetById shape,
// so one factory covers all of them instead of hand-writing four methods per entity.
function crud<T>(basePath: string, listAction = 'GetAll') {
  return {
    getAll: (): Promise<ApiResponse<T[]>> => apiClient.get(`${basePath}/${listAction}`),
    create: (payload: Partial<T>): Promise<ApiResponse<number>> => apiClient.post(`${basePath}/Create`, payload),
    update: (payload: Partial<T>): Promise<ApiResponse<null>> => apiClient.post(`${basePath}/Update`, payload),
    remove: (id: number): Promise<ApiResponse<null>> => apiClient.post(`${basePath}/Delete`, null, { params: { id } }),
  }
}

const colors = crud<ColorDto>('/LookColors')
const amenities = crud<AmenityDto>('/LookAmenities')
const specialities = crud<SpecialityDto>('/LookSpecialities')
const licenseTypes = crud<LicenseTypeDto>('/LookLicenseTypes')
const vehicleTypes = crud<VehicleTypeDto>('/LookVehicleTypes', 'GetAllVehicleTypes')
const vehicleProducers = crud<VehicleProducerDto>('/LookVehicleProducers')
const currencies = crud<CurrencyDto>('/LookCurrencies')
const countries = crud<CountryDto>('/LookCountries')
const nationalities = crud<NationalityDto>('/LookNationalities')
const cities = {
  ...crud<CityDto>('/LookCities'),
  getByCountryId: (countryId: number): Promise<ApiResponse<CityDto[]>> =>
    apiClient.get('/LookCities/GetByCountryId', { params: { countryId } }),
}
const vehicleModels = crud<VehicleModelDto>('/LookVehicleModels')
const stations = {
  ...crud<StationDto>('/LookStations'),
  getByCityId: (cityId: number): Promise<ApiResponse<StationDto[]>> =>
    apiClient.get('/LookStations/GetByCityId', { params: { cityId } }),
}

const lookupService = {
  getNationalities: nationalities.getAll,
  getCountries: countries.getAll,
  getCities: cities.getAll,

  colors,
  amenities,
  specialities,
  licenseTypes,
  vehicleTypes,
  vehicleProducers,
  currencies,
  countries,
  nationalities,
  cities,
  vehicleModels,
  stations,
}

export default lookupService
