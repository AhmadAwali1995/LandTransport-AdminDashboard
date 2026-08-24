import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ToastContainer from './Toast'
import UserMenu from './UserMenu'
import { useAuth } from '../context/AuthContext'
import {
  BrandIcon,
  DashboardIcon,
  DriverIcon,
  EmployeesIcon,
  LocationsIcon,
  LookupsIcon,
  OfficesIcon,
  VehicleIcon,
} from './icons/NavIcons'

const NAV_GROUPS = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, end: true },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/offices', label: 'Offices', icon: OfficesIcon, end: false },
      { to: '/drivers', label: 'Drivers', icon: DriverIcon, end: false },
      { to: '/employees', label: 'Employees', icon: EmployeesIcon, end: false },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/lookups', label: 'Lookups', icon: LookupsIcon, end: false },
      { to: '/locations', label: 'Locations', icon: LocationsIcon, end: false },
      { to: '/vehicle-models', label: 'Vehicle Models', icon: VehicleIcon, end: false },
    ],
  },
]

const NAV_ITEMS = NAV_GROUPS.flatMap(group => group.items)

function titleFromPath(pathname: string) {
  const match = NAV_ITEMS.find(item =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
  if (match) return match.label
  if (pathname.startsWith('/offices/new')) return 'New Office'
  if (pathname.includes('/edit')) return 'Edit Office'
  if (pathname.startsWith('/offices/')) return 'Office Details'
  if (pathname.startsWith('/drivers/')) return 'Driver Details'
  return 'Admin Dashboard'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const pageTitle = titleFromPath(location.pathname)
  const userEmail = user?.email || user?.userName || 'Signed in'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            <BrandIcon size={28} variant="mark" />
          </span>
          <div className="sidebar__brand-text">
            <span className="sidebar__title">FleetOS</span>
            <span className="sidebar__subtitle">Admin Dashboard</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.label ?? index} className="sidebar__group">
              {group.label && (
                <p className="sidebar__group-label">{group.label}</p>
              )}
              {group.items.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className="sidebar__link"
                  >
                    <span className="sidebar__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <header className="navbar">
        <div className="navbar__left">
          <button
            type="button"
            className="navbar__hamburger"
            onClick={() => setSidebarOpen(open => !open)}
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="navbar__title">{pageTitle}</h1>
        </div>

        <div className="navbar__right">
          <UserMenu email={userEmail} onLogout={handleLogout} />
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  )
}
