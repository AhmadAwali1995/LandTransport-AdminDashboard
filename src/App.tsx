import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Offices from './pages/Offices'
import OfficeDetails from './pages/OfficeDetails'
import OfficeForm from './pages/OfficeForm'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/offices" element={<Offices />} />
            <Route path="/offices/new" element={<OfficeForm />} />
            <Route path="/offices/:id" element={<OfficeDetails />} />
            <Route path="/offices/:id/edit" element={<OfficeForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/offices" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
