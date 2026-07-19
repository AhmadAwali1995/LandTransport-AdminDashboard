import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Offices from './pages/Offices'
import OfficeDetails from './pages/OfficeDetails'
import OfficeForm from './pages/OfficeForm'
import Drivers from './pages/Drivers'
import DriverDetails from './pages/DriverDetails'
import Employees from './pages/Employees'

function isLoggedIn() {
  return !!localStorage.getItem('authToken')
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  if (isLoading) return null
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()
  if (isLoading) return null
  return !isLoggedIn() ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/offices" element={<Offices />} />
        <Route path="/offices/new" element={<OfficeForm />} />
        <Route path="/offices/:id" element={<OfficeDetails />} />
        <Route path="/offices/:id/edit" element={<OfficeForm />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/drivers/:id" element={<DriverDetails />} />
        <Route path="/employees" element={<Employees />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
