import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/main.scss'

import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login/Login'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard/Dashboard'
import Clients from './pages/admin/Clients/Clients'
import ClientDetails from './pages/admin/ClientDetails/ClientDetails'
import Orders from './pages/admin/Orders/Orders'
import Deliveries from './pages/admin/Deliveries/Deliveries'
import Payments from './pages/admin/Payments/Payments'
import Admins from './pages/admin/Admins/Admins'
import Profile from './pages/admin/Profile/Profile'
import Expenses from './pages/admin/Expenses/Expenses'
import ClientLayout from './components/layout/ClientLayout'
import ClientPortal from './pages/client/ClientPortal/ClientPortal'

// ... existing imports

import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" />
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
              <Route path="expenses" element={<Expenses />} />
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
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
