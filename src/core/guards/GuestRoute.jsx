// src/core/guards/GuestRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import { getHomePath } from '../utils/panelLinks'

// Impede que usuários LOGADOS acessem login/cadastro
function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />

  // Também roda logo depois do login (a sessão muda e esta guarda renderiza
  // de novo), então é ela que decide o destino: a página de onde a pessoa
  // veio, ou o início de cada papel
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || getHomePath(user?.userType)} replace />
  }

  return <Outlet />
}

export default GuestRoute 
