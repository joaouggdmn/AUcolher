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
