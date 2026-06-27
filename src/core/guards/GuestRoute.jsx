// src/core/guards/GuestRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner/Spinner'

// Impede que usuários LOGADOS acessem login/cadastro
function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Spinner />

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute 
