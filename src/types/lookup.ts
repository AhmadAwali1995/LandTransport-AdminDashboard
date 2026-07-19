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
