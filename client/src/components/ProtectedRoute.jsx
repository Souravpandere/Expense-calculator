import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import DashboardLayout from '../layouts/DashboardLayout'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />
  if (!user) return <Navigate to="/login" replace />

  return <DashboardLayout>{children}</DashboardLayout>
}
