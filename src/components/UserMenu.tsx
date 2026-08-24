import { useEffect, useRef, useState } from 'react'

interface UserMenuProps {
  email: string
  onLogout: () => void
}

export default function UserMenu({ email, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const initial = (email || '?').trim().charAt(0).toUpperCase()

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className={`user-menu${open ? ' user-menu--open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen(value => !value)}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="user-menu__email">{email}</span>
        <svg
          className="user-menu__chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <p className="user-menu__signed-in">
            <span>Signed in as</span>
            <strong>{email}</strong>
          </p>
          <button
            type="button"
            className="user-menu__logout"
            role="menuitem"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
