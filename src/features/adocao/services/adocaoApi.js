import api from '../../../core/services/api'

// Chamadas à API de pedidos de adoção e avaliações. Recebem e devolvem os
// DTOs da API sem conversão — quem adapta para o formato das telas é o
// adocaoService. Contrato em docs/api-adocao.md

export async function createRequest(animalId) {
  const { data } = await api.post('/adoption-requests', { animalId })
  return data
}

// Os pedidos que a conta enviou ("Meus interesses")
export async function listSent() {
  const { data } = await api.get('/adoption-requests/sent')
  return data
}

// Os pedidos dos animais da conta
export async function listReceived() {
  const { data } = await api.get('/adoption-requests/received')
  return data
}

// ACCEPTED, REJECTED, AWAITING_DELIVERY, CONCLUDED ou CANCELLED — a API
// confere quem pode cada um
export async function changeStatus(id, status) {
  const { data } = await api.patch(`/adoption-requests/${id}/status`, { status })
  return data
}

// Cria ou edita a minha avaliação; responde com o pedido atualizado
export async function saveReview(id, { rating, comment }) {
  const { data } = await api.put(`/adoption-requests/${id}/review`, { rating, comment })
  return data
}

export async function deleteReview(id) {
  await api.delete(`/adoption-requests/${id}/review`)
}

// Público: média, distribuição, avaliações recebidas e adoções de um perfil
export async function getUserReviews(userId) {
  const { data } = await api.get(`/users/${userId}/reviews`)
  return data
}

// Painel do admin: todos os pedidos, enxutos
export async function listAllForAdmin() {
  const { data } = await api.get('/admin/adoption-requests')
  return data
}
