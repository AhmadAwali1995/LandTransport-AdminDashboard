import apiClient from './api'
import type { CityDto, CountryDto, NationalityDto } from '../types/lookup'

interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: string[]
}

const lookupService = {
  getNationalities: (): Promise<ApiResponse<NationalityDto[]>> =>
    apiClient.get('/LookNationalities/GetAll'),

  getCountries: (): Promise<ApiResponse<CountryDto[]>> =>
    apiClient.get('/LookCountries/GetAll'),

  getCities: (): Promise<ApiResponse<CityDto[]>> =>
    apiClient.get('/LookCities/GetAll'),
}

export default lookupService
