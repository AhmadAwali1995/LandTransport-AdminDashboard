import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ToastContainer from './Toast'

const NAV = [
  { to: '/offices', icon: '🏢', label: 'Offices' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">🚌</span>
          <div>
            <div className="sidebar__title">LandTransport</div>
            <div className="sidebar__subtitle">Admin Dashboard</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ color: 'var(--text-on-dark)', justifyContent: 'flex-start', gap: 10 }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <header className="navbar">
        <div className="navbar__left">
          <button
            type="button"
            className="navbar__hamburger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="navbar__title">Admin Dashboard</span>
        </div>
        <div className="navbar__right">
          <span className="navbar__user">admin@landtransport.com</span>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  )
}
