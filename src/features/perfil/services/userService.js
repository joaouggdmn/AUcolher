import api from '../../../core/services/api'
import { toFrontendProfile } from '../../../core/services/authService'
import { mockPublicProfiles } from '../data/mockPublicProfiles'

// "Minha conta": a conta editada é a do token, por isso a rota não leva id.
// Devolve o perfil como ficou no banco, no formato do usuário logado
export async function updateMyProfile(payload) {
  const { data } = await api.put('/usuarios/me', payload)
  return toFrontendProfile(data)
}

// 🔴 Trocar pela chamada real quando o endpoint existir no Spring Boot:
//   const { data } = await api.get(`/usuarios/${id}/perfil-publico`)
//   return data
export async function getPublicProfile(id) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPublicProfiles.find((profile) => String(profile.id) === String(id)) ?? null
}
