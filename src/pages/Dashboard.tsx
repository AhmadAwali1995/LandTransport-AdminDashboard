import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import adminOfficeService from '../services/adminOfficeService'
import adminDriverService from '../services/adminDriverService'
import adminEmployeeService from '../services/adminEmployeeService'
import {
  DriverIcon,
  EmployeesIcon,
  LocationsIcon,
  LookupsIcon,
  OfficesIcon,
} from '../components/icons/NavIcons'

const SHORTCUTS = [
  {
    key: 'newOffice',
    to: '/offices/new',
    label: 'Create office',
    desc: 'Register a main office and owner',
    icon: OfficesIcon,
    primary: true,
  },
  {
    key: 'offices',
    to: '/offices',
    label: 'Offices',
    desc: 'Browse and manage offices',
    icon: OfficesIcon,
  },
  {
    key: 'drivers',
    to: '/drivers',
    label: 'Drivers',
    desc: 'Review driver records',
    icon: DriverIcon,
  },
  {
    key: 'employees',
    to: '/employees',
    label: 'Employees',
    desc: 'Review office staff',
    icon: EmployeesIcon,
  },
  {
    key: 'lookups',
    to: '/lookups',
    label: 'Lookups',
    desc: 'Colors, types, and more',
    icon: LookupsIcon,
  },
  {
    key: 'locations',
    to: '/locations',
    label: 'Locations',
    desc: 'Countries, cities, stations',
    icon: LocationsIcon,
  },
]

const STAT_CARDS = [
  { key: 'offices', label: 'Offices', icon: OfficesIcon, to: '/offices' },
  { key: 'drivers', label: 'Drivers', icon: DriverIcon, to: '/drivers' },
  { key: 'employees', label: 'Employees', icon: EmployeesIcon, to: '/employees' },
] as const

const MORE_LINKS = [
  { to: '/offices', label: 'Offices' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/employees', label: 'Employees' },
  { to: '/lookups', label: 'Lookups' },
  { to: '/locations', label: 'Locations' },
  { to: '/vehicle-models', label: 'Vehicle Models' },
]

type Counts = {
  offices: number | null
  drivers: number | null
  employees: number | null
}

export default function Dashboard() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<Counts>({ offices: null, drivers: null, employees: null })
  const [loading, setLoading] = useState(true)
  const activeRef = useRef(true)

  const displayName = user?.englishName || user?.userName || user?.email || ''
  const todayLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  useEffect(() => {
    activeRef.current = true

    const loadCounts = async () => {
      setLoading(true)
      try {
        const [officesRes, driversRes, employeesRes] = await Promise.all([
          adminOfficeService.getOffices(),
          adminDriverService.getDrivers(),
          adminEmployeeService.getEmployees(),
        ])
        if (!activeRef.current) return
        setCounts({
          offices: officesRes.data?.length ?? 0,
          drivers: driversRes.data?.length ?? 0,
          employees: employeesRes.data?.length ?? 0,
        })
      } catch {
        if (!activeRef.current) return
        setCounts({ offices: null, drivers: null, employees: null })
      } finally {
        if (activeRef.current) setLoading(false)
      }
    }

    loadCounts()
    return () => {
      activeRef.current = false
    }
  }, [user])

  return (
    <div className="dashboard">
      <header className="dashboard__hero">
        <div className="dashboard__hero-copy">
          <p className="dashboard__eyebrow">{todayLabel}</p>
          <h1 className="dashboard__title">
            {displayName ? `Welcome back, ${displayName}` : 'Welcome back'}
          </h1>
          <p className="dashboard__subtitle">
            Manage offices, people, and catalog data for FleetOS.
          </p>
        </div>
      </header>

      <section className="dashboard__section" aria-labelledby="dashboard-shortcuts">
        <div className="dashboard__section-head">
          <h2 id="dashboard-shortcuts" className="dashboard__section-title">Quick actions</h2>
          <p className="dashboard__section-desc">Jump into the work you do most often.</p>
        </div>

        <div className="dashboard__shortcuts">
          {SHORTCUTS.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`dash-shortcut${item.primary ? ' dash-shortcut--primary' : ''}`}
              >
                <span className="dash-shortcut__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className="dash-shortcut__body">
                  <span className="dash-shortcut__label">{item.label}</span>
                  <span className="dash-shortcut__desc">{item.desc}</span>
                </span>
                <span className="dash-shortcut__arrow" aria-hidden="true">→</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="dashboard__section" aria-labelledby="dashboard-overview">
        <div className="dashboard__section-head">
          <h2 id="dashboard-overview" className="dashboard__section-title">Overview</h2>
          <p className="dashboard__section-desc">Current totals across the platform.</p>
        </div>

        <div className="dashboard__grid">
          {STAT_CARDS.map(card => {
            const Icon = card.icon
            return (
              <Link key={card.key} to={card.to} className="stat-card">
                <div className="stat-card__top">
                  <span className="stat-card__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span className="stat-card__arrow" aria-hidden="true">→</span>
                </div>
                <span className="stat-card__label">{card.label}</span>
                {loading ? (
                  <span className="skeleton skeleton-block" />
                ) : (
                  <span className="stat-card__value">
                    {counts[card.key] == null ? '—' : counts[card.key]}
                  </span>
                )}
                <span className="stat-card__hint">View all</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="dashboard__section" aria-labelledby="dashboard-browse">
        <div className="dashboard__section-head">
          <h2 id="dashboard-browse" className="dashboard__section-title">Browse</h2>
        </div>
        <div className="dashboard__links">
          {MORE_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="dash-link">
              <span>{link.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
