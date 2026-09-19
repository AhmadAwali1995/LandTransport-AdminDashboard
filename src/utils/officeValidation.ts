/**
 * Client-side checks that mirror DataAnnotations on
 * CreateMainOfficeRequest / EditOfficeRequest so users see the same rules
 * before a round-trip (Internal System pattern).
 */

const PHONE_PATTERN = /^\+[1-9]\d{0,3}[1-9]\d{5,13}$/
const SUBDOMAIN_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type OfficeFields = {
  enOfficeName: string
  arOfficeName: string
  enOfficeCommercialName: string
  arOfficeCommercialName: string
  subdomain: string
  officeNationalId: string
  officeEmails: string
  officePhoneNumbers: string
  cityId: string
  addressDetails: string
  coordinates: string
  nationalityId: string
  currencyId: string
  enTrademarkName: string
  arTrademarkName: string
  trademarkPath: string
}

export type OwnerUserFields = {
  firstName: string
  midName: string
  lastName: string
  email: string
  phoneNumber: string
  whatsappPhoneNumber: string
  nationalId: string
  nationalityId: string
  birthDate: string
  address: string
}

function reqLen(value: string, min: number, max: number, label: string): string {
  const v = value.trim()
  if (!v) return `${label} is required.`
  if (v.length < min || v.length > max) return `${label} must be ${min}–${max} characters.`
  return ''
}

function optLen(value: string, max: number, label: string): string {
  const v = value.trim()
  if (!v) return ''
  if (v.length > max) return `${label} must be at most ${max} characters.`
  return ''
}

function reqEmail(value: string, label: string): string {
  const v = value.trim()
  if (!v) return `${label} is required.`
  if (!EMAIL_PATTERN.test(v) || v.length > 200) return `${label} format is invalid.`
  return ''
}

function reqPhone(value: string, label: string): string {
  const v = value.trim()
  if (!v) return `${label} is required.`
  if (!PHONE_PATTERN.test(v)) {
    return `${label} must be +country code then 6–14 digits (no leading zero).`
  }
  return ''
}

function optPhone(value: string, label: string): string {
  const v = value.trim()
  if (!v) return ''
  if (v.length > 20) return `${label} must be at most 20 characters.`
  if (!PHONE_PATTERN.test(v)) {
    return `${label} must be +country code then 6–14 digits (no leading zero).`
  }
  return ''
}

export function validateOfficeForm(
  office: OfficeFields,
  owner: OwnerUserFields,
  options: { countryId: string; isEdit: boolean },
): Record<string, string> {
  const errs: Record<string, string> = {
    enOfficeName: reqLen(office.enOfficeName, 6, 200, 'English name'),
    arOfficeName: reqLen(office.arOfficeName, 6, 200, 'Arabic name'),
    enOfficeCommercialName: reqLen(office.enOfficeCommercialName, 4, 200, 'Commercial name (EN)'),
    arOfficeCommercialName: reqLen(office.arOfficeCommercialName, 4, 200, 'Commercial name (AR)'),
    officeNationalId: reqLen(office.officeNationalId, 6, 20, 'Office national ID'),
    officeEmails: reqEmail(office.officeEmails, 'Office email'),
    officePhoneNumbers: reqLen(office.officePhoneNumbers, 4, 200, 'Office phone'),
    addressDetails: reqLen(office.addressDetails, 6, 2000, 'Address'),
    enTrademarkName: reqLen(office.enTrademarkName, 2, 200, 'Trademark name (EN)'),
    arTrademarkName: reqLen(office.arTrademarkName, 2, 200, 'Trademark name (AR)'),
    firstName: reqLen(owner.firstName, 2, 100, 'First name'),
    lastName: reqLen(owner.lastName, 2, 100, 'Last name'),
    phoneNumber: reqPhone(owner.phoneNumber, 'Owner phone'),
  }

  const subdomain = office.subdomain.trim()
  if (!subdomain) {
    errs.subdomain = 'Subdomain is required.'
  } else if (subdomain.length < 3 || subdomain.length > 63) {
    errs.subdomain = 'Subdomain must be 3–63 characters.'
  } else if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    errs.subdomain = 'Enter a valid subdomain (lowercase letters, numbers, and hyphens only).'
  } else {
    errs.subdomain = ''
  }

  errs.countryId = options.countryId ? '' : 'Country is required.'
  errs.cityId = office.cityId ? '' : 'City is required.'
  errs.nationalityId = office.nationalityId ? '' : 'Nationality is required.'
  errs.currencyId = office.currencyId ? '' : 'Currency is required.'

  errs.coordinates = optLen(office.coordinates, 200, 'Coordinates')
  errs.trademarkPath = optLen(office.trademarkPath, 2000, 'Trademark image URL')
  errs.midName = optLen(owner.midName, 100, 'Middle name')
  errs.whatsappPhoneNumber = optPhone(owner.whatsappPhoneNumber, 'WhatsApp phone')
  errs.nationalId = optLen(owner.nationalId, 50, 'National ID')
  errs.address = optLen(owner.address, 700, 'Owner address')

  if (!options.isEdit) {
    errs.email = reqEmail(owner.email, 'Owner email')
  }

  return errs
}
