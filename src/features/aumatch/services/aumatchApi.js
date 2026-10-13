import api from '../../../core/services/api'

// Chamadas à API do AUmatch, que só aceita pessoa física (ONG e admin
// recebem 403). Recebem e devolvem os DTOs da API sem conversão — quem
// adapta para o formato das telas é o aumatchService

export async function getMatchProfile() {
  const { data } = await api.get('/match/profile')
  return data
}

// Substituição completa: pergunta que não vier fica sem resposta
export async function saveMatchProfile(payload) {
  const { data } = await api.put('/match/profile', payload)
  return data
}

// O deck inteiro, já ordenado pelo score
export async function getMatchDeck() {
  const { data } = await api.get('/match/deck')
  return data
}
