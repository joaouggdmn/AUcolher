import { USE_MOCK_CAMPANHAS } from '../../../core/utils/constants'
import * as doacoesApi from './doacoesApi'
import * as doacoesMock from './doacoesMock'

// Fachada do módulo: os componentes só conhecem estas funções e o modelo do
// frontend. Quem fala com o "servidor" é o adaptador — API real ou mock, os
// dois com as mesmas funções e os mesmos DTOs
const adapter = USE_MOCK_CAMPANHAS ? doacoesMock : doacoesApi

// "Simular pagamento" só existe no mock e só em desenvolvimento: com a API
// real quem aprova é o Mercado Pago (no sandbox, payer.first_name = "APRO")
export const CAN_SIMULATE_PAYMENT = USE_MOCK_CAMPANHAS && import.meta.env.DEV

// ---------- mappers DTO ↔ modelo ----------

export function toFrontendCampaign(dto) {
  const goalAmount = dto.goalAmount ?? 0
  const raisedAmount = dto.raisedAmount ?? 0

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
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
    },
    donor: dto.donor
      ? { id: dto.donor.id, name: dto.donor.name, photoUrl: dto.donor.photoUrl ?? null }
      : null,
  }
}

// ---------- operações: campanhas ----------

// As telas falam em ONG (`ongId`); a API, em inglês (`ngoId`)
export async function listCampaigns({ ongId, status } = {}) {
  const dtos = await adapter.listCampaigns({ ngoId: ongId, status })
  return dtos.map(toFrontendCampaign)
}

export async function getCampaign(id) {
  return toFrontendCampaign(await adapter.getCampaign(id))
}

export async function createCampaign(values) {
  return toFrontendCampaign(await adapter.createCampaign(toCampaignPayload(values)))
}

export async function updateCampaign(id, values) {
  return toFrontendCampaign(await adapter.updateCampaign(id, toCampaignPayload(values)))
}

export async function closeCampaign(id) {
  return toFrontendCampaign(await adapter.closeCampaign(id))
}

export async function deleteCampaign(id) {
  await adapter.deleteCampaign(id)
}

export async function listMyCampaigns() {
  const dtos = await adapter.listMyCampaigns()
  return dtos.map(toFrontendCampaign)
}

// ---------- operações: doações ----------

export async function createDonation(campaignId, amount) {
  return toFrontendDonation(await adapter.createDonation(campaignId, { amount }))
}

export async function getDonation(id) {
  return toFrontendDonation(await adapter.getDonation(id))
}

export async function listMyDonations() {
  const dtos = await adapter.listMyDonations()
  return dtos.map(toFrontendDonation)
}

export async function listReceivedDonations() {
  const dtos = await adapter.listReceivedDonations()
  return dtos.map(toFrontendDonation)
}

export async function simulateDonationApproval(id) {
  if (!CAN_SIMULATE_PAYMENT) throw new Error('Simular pagamento só existe no modo mock.')
  return toFrontendDonation(await doacoesMock.simulateDonationApproval(id))
}
