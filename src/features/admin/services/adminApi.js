import api from '../../../core/services/api'

// Adaptador da API: é o contrato de docs/contratos-prontos/api-admin.md em
// código. Todas as rotas exigem a conta ADMIN (o backend já restringe
// /api/admin/** a ROLE_ADMIN)

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

// ---------- denúncias (docs/contratos-prontos/api-denuncias-moderacao.md §1.4) ----------

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

// ---------- moderação direta (docs/contratos-prontos/api-denuncias-moderacao.md §2) ----------

// Banir (active: false) ou reativar (true) uma conta
export async function setUserStatus(userId, active) {
  const { data } = await api.patch(`/admin/users/${userId}/status`, { active })
  return data
}

// Remover conteúdo (docs/contratos-prontos/api-denuncias-moderacao.md §3). O anúncio também resolve as
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

// ---------- edição pela moderação (o conteúdo segue em nome do dono) ----------

// A conta inteira (os campos de "Minha conta", com o e-mail de login) + `active`
export async function getUser(userId) {
  const { data } = await api.get(`/admin/users/${userId}`)
  return data
}

// { email, profile: o corpo de PUT /users/me }
export async function updateUser(userId, body) {
  const { data } = await api.put(`/admin/users/${userId}`, body)
  return data
}

// O corpo de PUT /animals/{id}
export async function updateAnimal(animalId, body) {
  const { data } = await api.put(`/admin/animals/${animalId}`, body)
  return data
}

// O corpo de PUT /events/{id}
export async function updateEvent(eventId, body) {
  const { data } = await api.put(`/admin/events/${eventId}`, body)
  return data
}

// O corpo de PUT /campaigns/{id} — para quando as campanhas estiverem no backend
export async function updateCampaign(campaignId, body) {
  const { data } = await api.put(`/admin/campaigns/${campaignId}`, body)
  return data
}
