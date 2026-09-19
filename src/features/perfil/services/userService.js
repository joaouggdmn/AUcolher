import { mockPublicProfiles } from '../data/mockPublicProfiles'

// 🔴 Trocar pela chamada real quando o endpoint existir no Spring Boot:
//   const { data } = await api.get(`/usuarios/${id}/perfil-publico`)
//   return data
export async function getPublicProfile(id) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockPublicProfiles.find((profile) => String(profile.id) === String(id)) ?? null
}
