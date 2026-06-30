import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.errors?.[0]
        || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🚌</span>
          <div>
            <div style={styles.brandTitle}>LandTransport</div>
            <div style={styles.brandSub}>Admin Dashboard</div>
          </div>
        </div>

        <h1 style={styles.heading}>Sign in to your account</h1>

        {error && (
          <div className="alert alert--error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address <span className="form-required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="password">
              Password <span className="form-required">*</span>
            </label>
            <div style={styles.pwdWrap}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                style={styles.pwdToggle}
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={loading || !email || !password}
            style={{ height: 44, fontSize: 15 }}
          >
            {loading
              ? <><span className="btn__spinner" /> Signing in…</>
              : 'Sign in'
            }
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--sidebar)',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--surface)',
    borderRadius: 16,
    padding: '40px 36px',
    boxShadow: 'var(--shadow-lg)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  brandIcon: {
    fontSize: 32,
    lineHeight: 1,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--text)',
  },
  brandSub: {
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 24,
  },
  pwdWrap: {
    position: 'relative',
  },
  pwdToggle: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
    lineHeight: 1,
  },
}
