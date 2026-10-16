import * as adocaoApi from './adocaoApi'
import * as returnsMock from './returnsMock'
import { USE_MOCK_REABANDONO } from '../../../core/utils/constants'
import { toApiAnimal, toFrontendAnimal } from '../../animais/services/animalService'
import { toFrontendMatchProfile } from '../../aumatch/services/aumatchService'
import { buildAdopterSnapshot } from '../utils/buildAdopterSnapshot'
import { computeProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { isAccountBanned, isAnimalRemoved } from '../../admin/services/moderationMock'

// Fachada dos pedidos de adoção: as telas só conhecem estas funções e o
// formato de pedido que já usavam quando tudo era localStorage — o resto do
// app (painel da ONG, Minha conta, chat) muda pouco. Contrato em docs/contratos-prontos/api-adocao.md

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

  const snapshot = buildAdopterSnapshot(profile, completion)
  if (dto.userType !== 'NGO') return { ...snapshot, isOng: false }
  return { ...snapshot, isOng: true, lifestyleSummary: 'Pedido de uma ONG — o quiz do AUmatch é só para pessoas' }
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
    // Score congelado na conclusão (nulo sem quiz completo ou adotante ONG)
    matchScoreAtAdoption: dto.matchScoreAtAdoption ?? null,
    // RETURNED / REHOMED: { type, date, reason, note, recordedAt, rehomedAnimalId }
    returnInfo: dto.return ?? null,
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
// próprio banimento cancela no servidor. `isBanned` vem do useModeration
// quando a tela precisa reagir na hora a um banimento
export function withModeration(request, isBanned = isAccountBanned) {
  if (!ACTIVE_STATUSES.includes(request.status)) return request

  const removed = isAnimalRemoved({ id: request.animalId })
  const banned =
    isBanned({ id: request.ownerId, name: request.animal.organizationName ?? request.animal.ownerName }) ||
    isBanned({ id: request.adopter.userId, name: request.adopter.name })
  if (!removed && !banned) return request

  return {
    ...request,
    status: 'CANCELLED',
    cancelReason: removed ? 'LISTING_REMOVED' : 'ACCOUNT_BANNED',
    cancelledFromStatus: request.status,
    moderated: true,
  }
}

// ---------- operações ----------
// Devolvem os pedidos como o servidor guarda; a camada de moderação fica
// para quem mostra (AdoptionRequestProvider)

export async function listSentRequests() {
  return (await adocaoApi.listSent()).map(toFrontendRequest)
}

export async function listReceivedRequests() {
  return (await adocaoApi.listReceived()).map(toFrontendRequest)
}

export async function createAdoptionRequest(animalId) {
  return toFrontendRequest(await adocaoApi.createRequest(animalId))
}

export async function changeRequestStatus(id, status) {
  return toFrontendRequest(await adocaoApi.changeStatus(id, status))
}

export async function saveRequestReview(id, { rating, comment }) {
  return toFrontendRequest(await adocaoApi.saveReview(id, { rating, comment: comment?.trim() || null }))
}

export function deleteRequestReview(id) {
  return adocaoApi.deleteReview(id)
}

// ---------- retorno e repasse ----------
// Recebem o pedido como a API devolveu (o mock precisa dele para validar) e
// devolvem o pedido atualizado. Com USE_MOCK_REABANDONO, quem responde é o
// returnsMock; o `withReturnRecord` sobrepõe os registros dele aos pedidos

export const withReturnRecord = USE_MOCK_REABANDONO ? returnsMock.withReturnRecord : (request) => request

// O pedido de onde veio um anúncio republicado (nulo nos demais). `returnsData`
// vem do useReturnsMock, para a tela reagir a um repasse novo
export function originRequestIdOf(animal, returnsData) {
  if (USE_MOCK_REABANDONO) return returnsMock.originRequestIdOf(animal, returnsData)
  return animal.originRequestId ?? null
}

export async function registerReturn(request, { returnDate, reason, note }) {
  const body = { returnDate, reason, note: note?.trim() || null }
  if (USE_MOCK_REABANDONO) return returnsMock.registerReturn(request, body)
  return toFrontendRequest(await adocaoApi.registerReturn(request.id, body))
}

// O anúncio original, no formato de animal do front (o formulário usa como base)
export async function getRehomeDraft(request) {
  if (USE_MOCK_REABANDONO) return returnsMock.getRehomeDraft(request)
  return toFrontendAnimal(await adocaoApi.getRehomeDraft(request.id))
}

export async function rehome(request, { reason, note, form, photos }) {
  if (USE_MOCK_REABANDONO) return returnsMock.rehome(request, { reason, note, form, photos })
  const body = { reason, note: note?.trim() || null, animal: toApiAnimal(form, photos) }
  return toFrontendRequest(await adocaoApi.rehome(request.id, body))
}

export async function undoRehome(request) {
  if (USE_MOCK_REABANDONO) return returnsMock.undoRehome(request)
  return toFrontendRequest(await adocaoApi.undoRehome(request.id))
}

// Avaliações recebidas por um perfil, no formato do ReviewCard, mais média,
// quantas de cada nota (de 5 a 1) e as adoções concluídas da conta
export async function getUserReviews(userId) {
  const dto = await adocaoApi.getUserReviews(userId)
  return {
    reviews: dto.reviews.map((review) => ({
      id: review.id,
      authorId: review.author.id,
      authorName: review.author.name,
      authorPhotoUrl: review.author.photoUrl ?? null,
      authorIsOng: review.author.isOng,
      rating: review.rating,
      comment: review.comment ?? '',
      animalName: review.animalName,
      createdAt: review.updatedAt ?? review.createdAt,
    })),
    count: dto.count,
    average: dto.average,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: dto.distribution[stars] ?? 0 })),
    adoptionsCount: dto.adoptionsCount,
  }
}
