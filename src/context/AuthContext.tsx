import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import adminAuthService from '../services/adminAuthService'
import type { MeResponse } from '../services/adminAuthService'

interface AuthState {
  user: MeResponse | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true })

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setState({ user: null, isLoading: false })
      return
    }
    adminAuthService.me()
      .then(res => setState({ user: res.data, isLoading: false }))
      .catch(() => {
        localStorage.removeItem('authToken')
        setState({ user: null, isLoading: false })
      })
  }, [])

  const login = async (email: string, password: string) => {
    const res = await adminAuthService.login({ email, password })
    localStorage.setItem('authToken', res.data.accessToken)
    setState(s => ({ ...s, isLoading: false }))
  }

  const logout = async () => {
    try { await adminAuthService.logout() } catch { /* ignore */ }
    localStorage.removeItem('authToken')
    setState({ user: null, isLoading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
