import api from '../../../core/services/api'

// Adaptador real: é o contrato de docs/api-campanhas-eventos.md em código.
// doacoesMock.js tem as mesmas funções e devolve os mesmos DTOs. O Mercado
// Pago nunca é chamado daqui: o backend cria o PIX e consulta o pagamento

// ---------- campanhas ----------

export async function listCampaigns({ ngoId, status } = {}) {
  const { data } = await api.get('/campaigns', { params: { ngoId: ngoId ?? undefined, status: status ?? undefined } })
  return data
}

export async function getCampaign(id) {
  const { data } = await api.get(`/campaigns/${id}`)
  return data
}

export async function createCampaign(payload) {
  const { data } = await api.post('/campaigns', payload)
  return data
}

export async function updateCampaign(id, payload) {
  const { data } = await api.put(`/campaigns/${id}`, payload)
  return data
}

// Encerra antes do prazo e cancela os PIX ainda não pagos
export async function closeCampaign(id) {
  const { data } = await api.post(`/campaigns/${id}/close`)
  return data
}

export async function deleteCampaign(id) {
  await api.delete(`/campaigns/${id}`)
}

// Campanhas da ONG logada, ativas e encerradas
export async function listMyCampaigns() {
  const { data } = await api.get('/campaigns/mine')
  return data
}

// ---------- doações ----------

// Cria a cobrança PIX: a resposta traz o QR e o "copia e cola"
export async function createDonation(campaignId, payload) {
  const { data } = await api.post(`/campaigns/${campaignId}/donations`, payload)
  return data
}

// Enquanto PENDING, o backend também pergunta ao Mercado Pago
export async function getDonation(id) {
  const { data } = await api.get(`/donations/${id}`)
  return data
}

export async function listMyDonations() {
  const { data } = await api.get('/donations/mine')
  return data
}

// Aprovadas nas campanhas da ONG logada, com doador e campanha
export async function listReceivedDonations() {
  const { data } = await api.get('/donations/received')
  return data
}
