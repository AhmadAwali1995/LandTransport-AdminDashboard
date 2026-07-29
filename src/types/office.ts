export interface OfficeOwnerDto {
  enName: string | null
  arName: string | null
  email: string | null
  phone: string | null
}

export interface AdminOfficeOwnerDetailsDto {
  id: string
  firstNameEn: string
  midNameEn: string | null
  lastNameEn: string
  firstNameAr: string
  midNameAr: string | null
  lastNameAr: string
  email: string
  phoneNumber: string | null
  whatsappPhoneNumber: string | null
  nationalId: string | null
  nationalityId: number | null
  birthDate: string | null
  address: string | null
}

export interface AdminOfficeDetailsDto {
  id: number
  enName: string
  arName: string
  subdomain: string
  enCROfficeName: string
  arCROfficeName: string
  officeNationalId: string
  officeEmails: string
  officePhoneNumbers: string
  addressDetails: string
  coordinates: string | null
  cityId: number
  nationalityId: number
  enTrademarkName: string | null
  arTrademarkName: string | null
  trademarkPath: string | null
  owner: AdminOfficeOwnerDetailsDto | null
}

export interface ResetOwnerPasswordResponse {
  resetLink: string
}

export interface AdminOfficeInfoSectionDto {
  id: number
  enName: string
  arName: string
  subdomain: string
  enCROfficeName: string
  arCROfficeName: string
  officeNationalId: string
  officeEmails: string
  officePhoneNumbers: string
  addressDetails: string
  coordinates: string | null
  cityId: number
  nationalityId: number
  enTrademarkName: string | null
  arTrademarkName: string | null
  trademarkPath: string | null
  owner: OfficeOwnerDto | null
}

export interface AdminEmployeeDto {
  id: number
  enName: string
  arName: string
  jobEmail: string | null
  phoneNumber: string | null
  title: string | null
  department: string | null
  isOfficeOwner: boolean
  startingDate: string
}

export interface AdminVehicleDto {
  id: number
  vehicleNumber: string
  enOwnerFullName: string
  arOwnerFullName: string
  producerEnName: string | null
  producerArName: string | null
  manufacturingYear: number
  vehicleLicenseExp: string
}

export interface AdminDriverDto {
  id: number
  enName: string
  arName: string
  phoneNumber: string | null
  licenseNumber: string
  licenseTypeEnName: string | null
  licenseTypeArName: string | null
  licenseExpDate: string
}

export interface AdminOfficeDetailsFullDto {
  info: AdminOfficeInfoSectionDto
  employees: AdminEmployeeDto[]
  vehicles: AdminVehicleDto[]
  drivers: AdminDriverDto[]
}

export interface AdminMainOfficeDto {
  id: number
  enName: string
  arName: string
  officeEmails: string
  officePhoneNumbers: string
  addressDetails: string
  coordinates: string | null
  trademarkPath: string | null
  cityId: number
  nationalityId: number
  owner: OfficeOwnerDto | null
}
