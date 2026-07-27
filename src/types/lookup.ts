export interface NationalityDto {
  id: number
  nationalityEnName: string
  nationalityArName: string
  countryEnName: string
  countryArName: string
}

export interface CountryDto {
  id: number
  enName: string
  arName: string
  countryCode: string
  isoCode: string
}

export interface CityDto {
  id: number
  enName: string
  arName: string
  countryId: number
}

export interface ColorDto {
  id: number
  arName: string
  enName: string
}

export interface AmenityDto {
  id: number
  arName: string
  enName: string
  iconKey?: string | null
}

export interface SpecialityDto {
  id: number
  arName: string
  enName: string
}

export interface LicenseTypeDto {
  id: number
  licenseTypeArName: string
  licenseTypeEnName: string
}

export interface VehicleTypeDto {
  id: number
  vehicleTypeArName: string
  vehicleTypeEnName: string
}

export interface VehicleProducerDto {
  id: number
  producerArName: string
  producerEnName: string
}

export interface CurrencyDto {
  id: number
  code: string
  nameAr: string
  nameEn: string
  symbolAr: string
  symbolEn: string
}

export interface VehicleModelDto {
  id: number
  modelArName: string
  modelEnName: string
  vehicleProducerId: number
}

export interface PickupPointDto {
  id: number
  arName: string
  enName: string
  cityId: number
  location: string
}
