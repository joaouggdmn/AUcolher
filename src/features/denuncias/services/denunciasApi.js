import api from '../../../core/services/api'

// Adaptador da API: é o contrato de docs/contratos-prontos/api-denuncias-moderacao.md §1 em código

// POST /api/reports — { targetType, targetId, reason, description }. O
// backend monta a cópia do alvo a partir do banco
export async function createReport(payload) {
  const { data } = await api.post('/reports', payload)
  return data
}

// GET /api/reports/mine — as denúncias da conta logada
export async function listMyReports() {
  const { data } = await api.get('/reports/mine')
  return data
}
