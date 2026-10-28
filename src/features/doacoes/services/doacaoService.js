import * as doacoesApi from './doacoesApi'

// Fachada do módulo: os componentes só conhecem estas funções e o modelo do
// frontend. Quem fala com o servidor é o doacoesApi (DTOs da API). Quem
// aprova o PIX é o Mercado Pago (no sandbox, o backend manda
// payer.first_name = "APRO" e ele aprova sozinho)

// ---------- mappers DTO ↔ modelo ----------

export function toFrontendCampaign(dto) {
  const goalAmount = dto.goalAmount ?? 0
  const raisedAmount = dto.raisedAmount ?? 0

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
    // Nome livre que a ONG deu quando a categoria é OTHER
    customCategory: dto.customCategory ?? null,
    isUrgent: Boolean(dto.isUrgent),
    goalAmount,
    raisedAmount,
    donationsCount: dto.donationsCount ?? 0,
    // Meta 0 não divide por zero; acima de 100% a barra fica cheia
    progress: goalAmount > 0 ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100) : 0,
    isGoalReached: goalAmount > 0 && raisedAmount >= goalAmount,
    // null = sem capa; a tela escolhe a imagem padrão da categoria
    coverUrl: dto.coverUrl ?? null,
    deadline: dto.deadline ?? null,
    status: dto.status,
    isClosed: dto.status === 'CLOSED',
    createdAt: dto.createdAt ?? null,
    closedAt: dto.closedAt ?? null,
    // Última edição feita pelo admin (o dono vê "Editado pela moderação")
    moderatedAt: dto.moderatedAt ?? null,
    ong: {
      id: dto.ngo?.id ?? null,
      name: dto.ngo?.name ?? '',
      isVerified: Boolean(dto.ngo?.isVerified),
      photoUrl: dto.ngo?.photoUrl ?? null,
      city: dto.ngo?.city ?? '',
      state: dto.ngo?.state ?? '',
    },
  }
}

function textOrNull(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

// Valores do formulário (mesmo formato do modelo) → corpo de POST/PUT
export function toCampaignPayload(values) {
  const goalAmount = textOrNull(values.goalAmount)

  return {
    title: textOrNull(values.title),
    description: textOrNull(values.description),
    category: values.category || null,
    customCategory: values.category === 'OTHER' ? textOrNull(values.customCategory) : null,
    isUrgent: Boolean(values.isUrgent),
    goalAmount: goalAmount == null ? null : Number(goalAmount),
    deadline: values.deadline || null,
    coverUrl: values.coverUrl || null,
  }
}

export function toFrontendDonation(dto) {
  return {
    id: dto.id,
    amount: dto.amount,
    status: dto.status,
    createdAt: dto.createdAt,
    approvedAt: dto.approvedAt ?? null,
    // Só vem para o próprio doador, enquanto o PIX está pendente
    pix: dto.pix
      ? {
          qrCode: dto.pix.qrCode,
          qrCodeBase64: dto.pix.qrCodeBase64 || null,
          ticketUrl: dto.pix.ticketUrl ?? null,
          expiresAt: dto.pix.expiresAt,
        }
      : null,
    campaign: {
      id: dto.campaign.id,
      title: dto.campaign.title,
      ngoName: dto.campaign.ngoName ?? '',
      // Excluída depois da doação: o histórico mostra o título, sem link
      isRemoved: Boolean(dto.campaign.removed),
      isRemovedByModeration: Boolean(dto.campaign.removedByModeration),
    },
    donor: dto.donor
      ? { id: dto.donor.id, name: dto.donor.name, photoUrl: dto.donor.photoUrl ?? null }
      : null,
  }
}

// ---------- operações: campanhas ----------

// As telas falam em ONG (`ongId`); a API, em inglês (`ngoId`)
export async function listCampaigns({ ongId, status } = {}) {
  const dtos = await doacoesApi.listCampaigns({ ngoId: ongId, status })
  return dtos.map(toFrontendCampaign)
}

export async function getCampaign(id) {
  return toFrontendCampaign(await doacoesApi.getCampaign(id))
}

export async function createCampaign(values) {
  return toFrontendCampaign(await doacoesApi.createCampaign(toCampaignPayload(values)))
}

export async function updateCampaign(id, values) {
  return toFrontendCampaign(await doacoesApi.updateCampaign(id, toCampaignPayload(values)))
}

export async function closeCampaign(id) {
  return toFrontendCampaign(await doacoesApi.closeCampaign(id))
}

export async function deleteCampaign(id) {
  await doacoesApi.deleteCampaign(id)
}

export async function listMyCampaigns() {
  const dtos = await doacoesApi.listMyCampaigns()
  return dtos.map(toFrontendCampaign)
}

// ---------- operações: doações ----------

export async function createDonation(campaignId, amount) {
  return toFrontendDonation(await doacoesApi.createDonation(campaignId, { amount }))
}

export async function getDonation(id) {
  return toFrontendDonation(await doacoesApi.getDonation(id))
}

export async function listMyDonations() {
  const dtos = await doacoesApi.listMyDonations()
  return dtos.map(toFrontendDonation)
}

export async function listReceivedDonations() {
  const dtos = await doacoesApi.listReceivedDonations()
  return dtos.map(toFrontendDonation)
}
