// src/core/guards/OngRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

// Verifica login E se o usuário tem role de ONG verificada
function OngRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // userType vem de user.userType no payload do login (NGO | PERSON), já
  // convertido pelo authService para PESSOA | ONG | ADMIN
  if (user?.userType !== 'ONG') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default OngRoute 
