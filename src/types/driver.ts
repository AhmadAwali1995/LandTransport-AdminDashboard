export interface AdminDriverListItemDto {
  id: number
  enName: string
  arName: string
  phoneNumber: string | null
  email: string | null
  nationalityEnName: string | null
  licenseNumber: string
  licenseTypeEnName: string | null
  licenseExpDate: string
  officeId: number
  officeEnName: string | null
}

export interface AdminDriverDetailsDto {
  id: number
  enName: string
  arName: string
  address: string | null
  phoneNumber: string | null
  whatsappPhoneNumber: string | null
  email: string | null
  nationalId: string | null
  nationalityEnName: string | null
  nationalityArName: string | null
  profilePhotoUrl: string | null
  licenseNumber: string
  licenseDate: string
  licenseExpDate: string
  licenseTypeEnName: string | null
  licenseTypeArName: string | null
  licenseCountryEnName: string | null
  licensePhotoUrl: string | null
  officeId: number
  officeEnName: string | null
  officeArName: string | null
}
