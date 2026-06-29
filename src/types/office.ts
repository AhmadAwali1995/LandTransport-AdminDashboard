export interface OfficeOwnerDto {
  enName: string | null
  arName: string | null
  email: string | null
  phone: string | null
}

export interface AdminOfficeDetailsDto {
  id: number
  enName: string
  arName: string
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
  parentOfficeId: number | null
}

export interface AdminBranchOfficeDto {
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
  parentOfficeId: number
  owner: OfficeOwnerDto | null
}

export interface AdminOfficeInfoSectionDto {
  id: number
  enName: string
  arName: string
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
  parentOfficeId: number | null
  owner: OfficeOwnerDto | null
}

export interface AdminBranchSummaryDto {
  id: number
  enName: string
  arName: string
  officeEmails: string
  officePhoneNumbers: string
  addressDetails: string
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
  branches: AdminBranchSummaryDto[]
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
  branches: AdminBranchOfficeDto[]
}
