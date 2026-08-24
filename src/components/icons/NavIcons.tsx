import logoFullUrl from '../../assets/logo-full.png'
import logoMarkUrl from '../../assets/logo-mark.png'

function svgProps(size = 18) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
}

export function DashboardIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function DriverIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function VehicleIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 16V9.5A2.5 2.5 0 0 1 6.5 7H14l4 4v5" />
      <path d="M4 16h16v1.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 17.5V16Z" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
      <path d="M14 7v4h4" />
    </svg>
  )
}

export function EmployeesIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14.5c2.8.4 4.8 2 5.5 4.5" />
    </svg>
  )
}

export function OfficesIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5H12v15" />
      <path d="M12 20V3.5A1.5 1.5 0 0 1 13.5 2H18.5A1.5 1.5 0 0 1 20 3.5V20" />
      <path d="M4 20h16" />
      <path d="M7 8h2" />
      <path d="M7 12h2" />
      <path d="M15 6h2" />
      <path d="M15 10h2" />
      <path d="M15 14h2" />
    </svg>
  )
}

export function LookupsIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LocationsIcon({ size = 18 }: { size?: number } = {}) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

export function BrandIcon({ size = 28, variant = 'full' }: { size?: number; variant?: 'full' | 'mark' } = {}) {
  const src = variant === 'mark' ? logoMarkUrl : logoFullUrl
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="brand-logo"
      aria-hidden="true"
    />
  )
}
