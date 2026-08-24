import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandIcon } from '../components/icons/NavIcons'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: string[] } } }
      const msg = axiosErr?.response?.data?.message
        || axiosErr?.response?.data?.errors?.[0]
        || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__header">
          <div className="login__logo" aria-hidden="true">
            <BrandIcon size={64} variant="mark" />
          </div>
          <h1 className="login__title">FleetOS</h1>
          <p className="login__subtitle">Admin Dashboard</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert alert--error login__alert" role="alert">
              <span className="alert__icon" aria-hidden="true">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              dir="ltr"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              dir="ltr"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--block login__submit"
            disabled={loading}
          >
            {loading && <span className="btn__spinner" aria-hidden="true" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
