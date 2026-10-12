// src/core/guards/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // userType vem do login (PERSON | NGO | ADMIN na API), já convertido pelo
  // authService para PESSOA | ONG | ADMIN
  if (user?.userType !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute 
