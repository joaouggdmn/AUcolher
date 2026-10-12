import api from '../../../core/services/api'

// Adaptador real: é o contrato de docs/api-admin.md §6 em código.
// denunciasMock.js tem as mesmas funções e devolve os mesmos DTOs

// POST /api/reports — { targetType, targetId, reason, description }. O
// backend monta a cópia do alvo a partir do banco; o segundo argumento que a
// fachada passa só existe para o mock, que não tem de onde tirá-la
export async function createReport(payload) {
  const { data } = await api.post('/reports', payload)
  return data
}

// GET /api/reports/mine — as denúncias da conta logada
export async function listMyReports() {
  const { data } = await api.get('/reports/mine')
  return data
}
