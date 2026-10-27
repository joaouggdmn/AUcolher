import { USE_MOCK_ADMIN, USE_MOCK_CAMPANHAS } from '../../../core/utils/constants'
import { toFrontendProfile } from '../../../core/services/authService'
import { toApiAnimal, toFrontendAnimal } from '../../animais/services/animalService'
import { toFrontendReport } from '../../denuncias/services/denunciaService'
import { toCampaignPayload, toFrontendCampaign } from '../../doacoes/services/doacaoService'
import * as doacoesMock from '../../doacoes/services/doacoesMock'
import { toEventPayload, toFrontendEvent } from '../../eventos/services/eventoService'
import { readDeletedAccounts } from '../../perfil/services/accountDeletionMock'
import { toApiPayload } from '../../perfil/utils/accountForm'
import * as adminApi from './adminApi'
import * as adminMock from './adminMock'
import { withMockCampaignStats } from './campaignAdminStats'

// Fachada do painel do admin: as telas só conhecem estas funções e o modelo
// do frontend. Animais, campanhas e eventos usam os mesmos mappers das
// outras telas; contas e números ganham os seus aqui
const adapter = USE_MOCK_ADMIN ? adminMock : adminApi

// 🔴 Campanhas e doações ainda não estão no backend: com a API real do admin
// e VITE_USE_MOCK_CAMPANHAS ligada, a lista, a remoção e os blocos de
// campanha da Visão geral continuam vindo do mock
const CAMPAIGNS_FROM_MOCK = !USE_MOCK_ADMIN && USE_MOCK_CAMPANHAS
const campaignAdapter = USE_MOCK_ADMIN || USE_MOCK_CAMPANHAS ? adminMock : adminApi

const FRONTEND_USER_TYPES = { NGO: 'ONG', PERSON: 'PESSOA', ADMIN: 'ADMIN' }

// ---------- mappers DTO → modelo ----------

// Série mensal da API → pontos do monthColumns ([{ month, value, count }])
function toPoints(series = [], { valueOf, countOf = valueOf }) {
  return series.map((point) => ({ month: point.month, value: valueOf(point), count: countOf(point) }))
}

export function toFrontendAdminStats(dto) {
  const { users, animals, adoptions, donations } = dto

  return {
    users: {
      total: users.total,
      persons: users.persons,
      ngos: users.ngos,
      newByMonth: toPoints(users.newByMonth, { valueOf: (point) => point.persons + point.ngos }),
    },
    animals: {
      available: animals.available,
      inProgress: animals.inProgress,
      adopted: animals.adopted,
      total: animals.available + animals.inProgress + animals.adopted,
      bySpecies: animals.bySpecies,
    },
    adoptions: {
      funnel: adoptions.funnel,
      concludedByMonth: toPoints(adoptions.concludedByMonth, { valueOf: (point) => point.count }),
    },
    donations: {
      totalRaised: donations.totalRaised,
      approvedCount: donations.approvedCount,
      raisedByMonth: toPoints(donations.raisedByMonth, {
        valueOf: (point) => point.amount,
        countOf: (point) => point.count,
      }),
    },
    campaigns: dto.campaigns,
    events: dto.events,
    ngoRanking: dto.ngoRanking,
    recentActivity: dto.recentActivity.map((item) => ({
      ...item,
      detail: item.type === 'ACCOUNT_CREATED' ? FRONTEND_USER_TYPES[item.detail] ?? item.detail : item.detail,
    })),
    reports: dto.reports ?? { pending: 0, pendingTargets: 0 },
    // Taxa de reabandono; `isSample` só vem do mock (números de exemplo)
    returns: dto.returns ? { ...dto.returns, isSample: Boolean(dto.returns.isSample) } : null,
  }
}

export function toFrontendAdminUser(dto) {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? null,
    userType: FRONTEND_USER_TYPES[dto.userType] ?? dto.userType,
    photoUrl: dto.photoUrl ?? null,
    city: dto.city ?? '',
    state: dto.state ?? '',
    isVerified: Boolean(dto.isVerified),
    isActive: dto.active !== false,
    createdAt: dto.createdAt ?? null,
    animalsCount: dto.animalsCount ?? 0,
    // Conta excluída pela própria pessoa: não volta, nem pela moderação
    deletedAt: dto.deletedAt ?? null,
  }
}

// ---------- operações ----------

export async function getAdminStats() {
  const dto = await adapter.getStats()
  return toFrontendAdminStats(CAMPAIGNS_FROM_MOCK ? withMockCampaignStats(dto) : dto)
}

// 🔴 Exclusão no modo mock (USE_MOCK_EXCLUSAO): a API ainda não sabe quem
// excluiu a conta, então a data vem do servidor falso
function withMockDeletions(users) {
  const deleted = readDeletedAccounts()
  if (deleted.length === 0) return users
  return users.map((user) => {
    const match = deleted.find((row) => String(row.id) === String(user.id))
    return match ? { ...user, deletedAt: match.deletedAt, isActive: false } : user
  })
}

export async function listAdminUsers() {
  const dtos = await adapter.listUsers()
  return withMockDeletions(dtos.map(toFrontendAdminUser))
}

// `ownerIsBanned` / `isOngBanned`: a conta foi banida, então o site já não
// mostra o conteúdo (o admin continua vendo)
export async function listAdminAnimals() {
  const dtos = await adapter.listAnimals()
  return dtos.map((dto) => ({ ...toFrontendAnimal(dto), ownerIsBanned: dto.owner?.active === false }))
}

// `isRemoved`: excluída (pela ONG ou, com `isRemovedByModeration`, pelo admin)
export async function listAdminCampaigns() {
  const dtos = await campaignAdapter.listCampaigns()
  return dtos.map((dto) => ({
    ...toFrontendCampaign(dto),
    isRemoved: Boolean(dto.removed),
    isRemovedByModeration: Boolean(dto.removedByModeration),
    isOngBanned: dto.ngo?.active === false,
  }))
}

// Eventos sempre pela API real, mesmo com o resto do painel no mock
export async function listAdminEvents() {
  const dtos = await adminApi.listEvents()
  return dtos.map((dto) => ({
    ...toFrontendEvent(dto),
    isRemovedByModeration: Boolean(dto.removedByModeration),
    isOngBanned: dto.ngo?.active === false,
  }))
}

// Mesmo modelo das denúncias do site, mais `reporter`
export async function listAdminReports() {
  const dtos = await adapter.listReports()
  return dtos.map(toFrontendReport)
}

export async function dismissAdminReports(reportId) {
  const dtos = await adapter.dismissReports(reportId)
  return dtos.map(toFrontendReport)
}

export async function banReportedAccount(reportId) {
  const dtos = await adapter.banReportedAccount(reportId)
  return dtos.map(toFrontendReport)
}

// false = banir, true = reativar
export async function setAdminUserStatus(userId, active) {
  return toFrontendAdminUser(await adapter.setUserStatus(userId, active))
}

export function removeAdminAnimal(animalId) {
  return adapter.removeAnimal(animalId)
}

export function removeAdminCampaign(campaignId) {
  return campaignAdapter.removeCampaign(campaignId)
}

export function removeAdminEvent(eventId) {
  return adminApi.removeEvent(eventId)
}

// ---------- edição pela moderação (o conteúdo segue em nome do dono) ----------
// Contas, animais e eventos sempre pela API real: eles já moram nela, e o
// mock do admin não tem as contas completas. Campanhas seguem a flag do módulo

// A conta no formato de "Minha conta" (o mesmo dos formulários), mais isActive
export async function getAdminUser(userId) {
  const dto = await adminApi.getUser(userId)
  return { ...toFrontendProfile(dto), isActive: dto.active !== false }
}

// `account`: a conta no formato de "Minha conta", já com as mudanças
export async function updateAdminUser(userId, { email, account }) {
  const dto = await adminApi.updateUser(userId, { email, profile: toApiPayload(account, account.userType) })
  return { ...toFrontendProfile(dto), isActive: dto.active !== false }
}

export async function updateAdminAnimal(animalId, form, photos) {
  return toFrontendAnimal(await adminApi.updateAnimal(animalId, toApiAnimal(form, photos)))
}

export async function updateAdminEvent(eventId, values) {
  return toFrontendEvent(await adminApi.updateEvent(eventId, toEventPayload(values)))
}

export async function updateAdminCampaign(campaignId, values) {
  const update = USE_MOCK_CAMPANHAS ? doacoesMock.updateCampaignForAdmin : adminApi.updateCampaign
  return toFrontendCampaign(await update(campaignId, toCampaignPayload(values)))
}
