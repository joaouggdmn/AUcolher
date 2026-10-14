import api from '../../../core/services/api'
import { toFrontendProfile } from '../../../core/services/authService'

// "Minha conta": a conta editada é a do token, por isso a rota não leva id.
// Devolve o perfil como ficou no banco, no formato do usuário logado
export async function updateMyProfile(payload) {
  const { data } = await api.put('/users/me', payload)
  return toFrontendProfile(data)
}

// GET /users/{id}/public-profile — mesmos campos do usuário logado, sem
// e-mail. Conta inexistente, desativada ou admin responde 404: a tela mostra
// "Perfil não encontrado"
export async function getPublicProfile(id) {
  try {
    const { data } = await api.get(`/users/${id}/public-profile`)
    return toFrontendProfile(data)
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}
