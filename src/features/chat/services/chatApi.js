import api from '../../../core/services/api'

// Adaptador real: é o contrato de docs/entrega-final/api-chat.md §3 em código.
// chatMock.js tem as mesmas funções e devolve os mesmos DTOs. A conversa é o
// próprio pedido de adoção: `requestId` é o id do pedido

// Todas as conversas da conta logada, com as não lidas e a última mensagem
export async function getSummary() {
  const { data } = await api.get('/chats/summary')
  return data
}

// Sem `after`, o histórico inteiro; com `after`, só as mensagens com id maior
export async function listMessages(requestId, after) {
  const { data } = await api.get(`/chats/${requestId}/messages`, { params: { after: after ?? undefined } })
  return data
}

export async function sendMessage(requestId, text) {
  const { data } = await api.post(`/chats/${requestId}/messages`, { text })
  return data
}

// `lastMessageId` é a última mensagem que apareceu na tela
export async function markRead(requestId, lastMessageId) {
  await api.put(`/chats/${requestId}/read`, { lastMessageId })
}
