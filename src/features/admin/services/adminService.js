import { USE_MOCK_ADMIN } from '../../../core/utils/constants'
import { toFrontendAnimal } from '../../animais/services/animalService'
import { toFrontendReport } from '../../denuncias/services/denunciaService'
import { toFrontendCampaign } from '../../doacoes/services/doacaoService'
import { toFrontendEvent } from '../../eventos/services/eventoService'
import * as adminApi from './adminApi'
import * as adminMock from './adminMock'

// Fachada do painel do admin: as telas só conhecem estas funções e o modelo
// do frontend. Animais, campanhas e eventos usam os mesmos mappers das
// outras telas; contas e números ganham os seus aqui
const adapter = USE_MOCK_ADMIN ? adminMock : adminApi

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
  }
}

// ---------- operações ----------

export async function getAdminStats() {
  return toFrontendAdminStats(await adapter.getStats())
}

export async function listAdminUsers() {
  const dtos = await adapter.listUsers()
  return dtos.map(toFrontendAdminUser)
}

// `ownerIsBanned` / `isOngBanned`: a conta foi banida, então o site já não
// mostra o conteúdo (o admin continua vendo)
export async function listAdminAnimals() {
  const dtos = await adapter.listAnimals()
  return dtos.map((dto) => ({ ...toFrontendAnimal(dto), ownerIsBanned: dto.owner?.active === false }))
}

// `isRemoved`: excluída (pela ONG ou, com `isRemovedByModeration`, pelo admin)
export async function listAdminCampaigns() {
  const dtos = await adapter.listCampaigns()
  return dtos.map((dto) => ({
    ...toFrontendCampaign(dto),
    isRemoved: Boolean(dto.removed),
    isRemovedByModeration: Boolean(dto.removedByModeration),
    isOngBanned: dto.ngo?.active === false,
  }))
}

export async function listAdminEvents() {
  const dtos = await adapter.listEvents()
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
  return adapter.removeCampaign(campaignId)
}

export function removeAdminEvent(eventId) {
  return adapter.removeEvent(eventId)
}
