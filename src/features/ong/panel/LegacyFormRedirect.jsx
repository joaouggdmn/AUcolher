import { Navigate, useParams } from 'react-router-dom'

// Rotas antigas dos formulários (/eventos/criar, /campanhas/editar/:id...)
// agora abrem no painel. `to` é o caminho, ou uma função do id da rota
function LegacyFormRedirect({ to }) {
  const { id } = useParams()
  return <Navigate to={typeof to === 'function' ? to(id) : to} replace />
}

export default LegacyFormRedirect
