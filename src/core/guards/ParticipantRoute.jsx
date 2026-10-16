// src/core/guards/ParticipantRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'
import { ADMIN_PATHS } from '../../features/admin/panel/adminPaths'

// Telas de quem participa do site (pessoa e ONG): favoritos, anunciar,
// pedidos e chat. O admin modera, mas não participa — vai para o painel
function ParticipantRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.userType === 'ADMIN') {
    return <Navigate to={ADMIN_PATHS.overview} replace />
  }

  return <Outlet />
}

export default ParticipantRoute
