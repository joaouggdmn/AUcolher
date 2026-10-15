// src/core/guards/PessoaRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

// Telas só de pessoa física ("Meus animais"): a ONG faz o mesmo pelo painel
function PessoaRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.userType !== 'PESSOA') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PessoaRoute
