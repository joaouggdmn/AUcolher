import * as adocaoApi from './adocaoApi'
import { toFrontendAnimal } from '../../animais/services/animalService'
import { toFrontendMatchProfile } from '../../aumatch/services/aumatchService'
import { buildAdopterSnapshot } from '../utils/buildAdopterSnapshot'
import { computeProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { isAccountBanned, isAnimalRemoved } from '../../admin/services/moderationMock'

// Fachada dos pedidos de adoção: as telas só conhecem estas funções e o
// formato de pedido que já usavam quando tudo era localStorage — o resto do
// app (painel da ONG, Minha conta, chat) muda pouco. Contrato em docs/api-adocao.md

const ACTIVE_STATUSES = ['PENDING', 'ACCEPTED', 'AWAITING_DELIVERY']

// ---------- conversão DTO → modelo ----------

// Avaliação dentro do pedido, no formato antigo do localStorage
function toFrontendReview(dto) {
  if (!dto) return null
  return {
    id: dto.id,
    rating: dto.rating,
    comment: dto.comment ?? '',
    authorId: dto.author.id,
    authorName: dto.author.name,
    authorPhotoUrl: dto.author.photoUrl ?? null,
    authorIsOng: dto.author.isOng,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
  }
}

// Quem pediu, como o card do dono mostra: as respostas do quiz já no formato
// do front, o resumo do estilo de vida e a completude do perfil. ONG não
// responde o quiz, então fica sem completude (o card esconde o selo)
function toFrontendAdopter(dto) {
  const answers = dto.matchProfile ? toFrontendMatchProfile(dto.matchProfile) : {}
  const isPerson = dto.userType === 'PERSON'
  const profile = { id: dto.id, name: dto.name, photoUrl: dto.photoUrl, city: dto.city, state: dto.state, ...answers }
  // Toda conta tem e-mail; a API só não expõe o do adotante
  const completion = isPerson ? computeProfileCompletion({ ...profile, email: '-', userType: 'PESSOA' }).percentage : null

  return { ...buildAdopterSnapshot(profile, completion), isOng: dto.userType === 'NGO' }
}

export function toFrontendRequest(dto) {
  return {
    id: dto.id,
    animalId: dto.animal.id,
    ownerId: dto.animal.owner.id,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    concludedAt: dto.concludedAt,
    closedAt: dto.closedAt,
    cancelReason: dto.cancelReason,
    cancelledFromStatus: dto.cancelledFromStatus,
    animalSource: 'api',
    animal: toFrontendAnimal(dto.animal),
    adopter: toFrontendAdopter(dto.adopter),
    matchScore: dto.matchScore,
    reviews: {
      adopter: toFrontendReview(dto.reviews?.adopter),
      owner: toFrontendReview(dto.reviews?.owner),
    },
  }
}

// 🔴 Moderação no modo mock (USE_MOCK_ADMIN): a API ainda não sabe quem o
// admin baniu nem o que ele removeu. Pedido ativo com uma parte banida ou com
// o anúncio removido aparece cancelado, com o motivo, e não aceita mais
// ações — só na tela, o servidor não muda. Com a moderação no backend, o
// próprio banimento cancela no servidor
function withModeration(request) {
  if (!ACTIVE_STATUSES.includes(request.status)) return request

  const removed = isAnimalRemoved({ id: request.animalId })
  const banned =
    isAccountBanned({ id: request.ownerId, name: request.animal.organizationName ?? request.animal.ownerName }) ||
    isAccountBanned({ id: request.adopter.userId, name: request.adopter.name })
  if (!removed && !banned) return request

  return {
    ...request,
    status: 'CANCELLED',
    cancelReason: removed ? 'LISTING_REMOVED' : 'ACCOUNT_BANNED',
    cancelledFromStatus: request.status,
    moderated: true,
  }
}

const toScreen = (dto) => withModeration(toFrontendRequest(dto))

// ---------- operações ----------

export async function listSentRequests() {
  return (await adocaoApi.listSent()).map(toScreen)
}

export async function listReceivedRequests() {
  return (await adocaoApi.listReceived()).map(toScreen)
}

export async function createAdoptionRequest(animalId) {
  return toScreen(await adocaoApi.createRequest(animalId))
}

export async function changeRequestStatus(id, status) {
  return toScreen(await adocaoApi.changeStatus(id, status))
}

export async function saveRequestReview(id, { rating, comment }) {
  return toScreen(await adocaoApi.saveReview(id, { rating, comment: comment?.trim() || null }))
}

export function deleteRequestReview(id) {
  return adocaoApi.deleteReview(id)
}
