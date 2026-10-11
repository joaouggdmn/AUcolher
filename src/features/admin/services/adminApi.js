import api from '../../../core/services/api'

// Adaptador real: é o contrato de docs/api-admin.md em código. adminMock.js
// tem as mesmas funções e devolve os mesmos DTOs. Todas as rotas exigem
// a conta ADMIN (o backend já restringe /api/admin/** a ROLE_ADMIN)

export async function getStats() {
  const { data } = await api.get('/admin/stats')
  return data
}

export async function listUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function listAnimals() {
  const { data } = await api.get('/admin/animals')
  return data
}

export async function listCampaigns() {
  const { data } = await api.get('/admin/campaigns')
  return data
}

export async function listEvents() {
  const { data } = await api.get('/admin/events')
  return data
}

// ---------- denúncias (docs/api-admin.md §6.4) ----------

export async function listReports() {
  const { data } = await api.get('/admin/reports')
  return data
}

// Arquiva esta denúncia e as outras pendentes do mesmo alvo
export async function dismissReports(reportId) {
  const { data } = await api.post(`/admin/reports/${reportId}/dismiss`)
  return data
}

// Bane a conta denunciada (perfil) ou a dona do anúncio denunciado
export async function banReportedAccount(reportId) {
  const { data } = await api.post(`/admin/reports/${reportId}/ban`)
  return data
}

// ---------- moderação direta (docs/api-admin.md §7) ----------

// Banir (active: false) ou reativar (true) uma conta
export async function setUserStatus(userId, active) {
  const { data } = await api.patch(`/admin/users/${userId}/status`, { active })
  return data
}

// Remover conteúdo (docs/api-admin.md §8). O anúncio também resolve as
// denúncias pendentes contra ele
export async function removeAnimal(animalId) {
  await api.delete(`/admin/animals/${animalId}`)
}

export async function removeCampaign(campaignId) {
  await api.delete(`/admin/campaigns/${campaignId}`)
}

export async function removeEvent(eventId) {
  await api.delete(`/admin/events/${eventId}`)
}
