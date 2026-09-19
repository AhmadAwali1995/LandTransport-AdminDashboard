/** Known DataAnnotations ErrorMessage keys from the LandTransport API. */
const KNOWN_API_ERRORS: Record<string, string> = {
  phoneNumberInvalidErrorMessage:
    'Enter a valid phone number (+country code, then 6–14 digits, no leading zero).',
  adminPhoneNumberInvalidErrorMessage:
    'Enter a valid phone number (+country code, then 6–14 digits, no leading zero).',
  subdomainInvalidFormatErrorMessage:
    'Enter a valid subdomain (lowercase letters, numbers, and hyphens only).',
}

function translateMessage(keyOrMessage: string): string {
  return KNOWN_API_ERRORS[keyOrMessage] ?? keyOrMessage
}

/** `AdminUser.FirstName` / `Office.EnOfficeName` / `Owner.LastName` → form field key. */
function toFormField(apiKey: string): string {
  const leaf = apiKey.includes('.') ? apiKey.slice(apiKey.lastIndexOf('.') + 1) : apiKey
  return leaf.charAt(0).toLowerCase() + leaf.slice(1)
}

/**
 * Maps ASP.NET ProblemDetails `errors` (or ResponseModel errors) onto camelCase
 * form field keys, the same way Internal System's `translateApiErrors` does.
 */
export function translateApiErrors(
  errors: Record<string, string | string[]> | undefined | null,
): { fieldErrors: Record<string, string>; summary: string } {
  const fieldErrors: Record<string, string> = {}
  const messages: string[] = []

  Object.entries(errors || {}).forEach(([field, keys]) => {
    const keyList = Array.isArray(keys) ? keys : [keys]
    const translated = keyList.map(translateMessage).filter(Boolean)
    if (translated.length) {
      fieldErrors[toFormField(field)] = translated[0]
      messages.push(...translated)
    }
  })

  return { fieldErrors, summary: messages.join(' ') }
}
