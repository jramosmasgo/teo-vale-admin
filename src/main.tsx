import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/main.scss'

import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Clients from './pages/admin/Clients'
import ClientDetails from './pages/admin/ClientDetails'
import Orders from './pages/admin/Orders'
import Deliveries from './pages/admin/Deliveries'
import Payments from './pages/admin/Payments'
import Admins from './pages/admin/Admins'
import Profile from './pages/admin/Profile'
import ClientLayout from './components/layout/ClientLayout'
import ClientPortal from './pages/client/ClientPortal'

// ... existing imports

import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="orders" element={<Orders />} />
            <Route path="payments" element={<Payments />} />
            <Route path="users" element={<Admins />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Client Routes */}
          <Route path="/client" element={<ClientLayout><ClientPortal /></ClientLayout>} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
