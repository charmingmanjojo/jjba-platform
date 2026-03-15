import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './styles/globals.css'

// Pages / Components
import AuthPage from './components/auth/AuthPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import DashboardOverview from './pages/DashboardOverview'
import StandCreator from './components/stands/StandCreator'
import PartCreator from './components/parts/PartCreator'

// Lazy route guard
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="app-background" />
      <p className="text-jojo-gold font-display text-lg animate-pulse">Loading...</p>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="stands/new" element={<StandCreator />} />
        <Route path="parts/new" element={<PartCreator />} />
        {/* 
          Add these routes as you build out the rest:
          <Route path="parts/:id" element={<PartDetail />} />
          <Route path="stands/:id" element={<StandDetail />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chat" element={<ChatList />} />
        */}
        <Route path="*" element={
          <div className="text-center py-20">
            <p className="heading-gold text-3xl mb-2">「?」</p>
            <p className="text-gray-500 font-mono">This page doesn't exist... yet.</p>
          </div>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 10, 46, 0.95)',
              color: '#f0e6d3',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              fontFamily: '"Josefin Sans", sans-serif',
              fontSize: '13px',
              backdropFilter: 'blur(12px)',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#1A0A2E' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
