import { USE_MOCK_ADMIN } from '../../../core/utils/constants'
import { toFrontendAnimal } from '../../animais/services/animalService'
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

export async function listAdminAnimals() {
  const dtos = await adapter.listAnimals()
  return dtos.map(toFrontendAnimal)
}

// `isRemoved`: excluída pela ONG, mas ainda contando no total arrecadado
export async function listAdminCampaigns() {
  const dtos = await adapter.listCampaigns()
  return dtos.map((dto) => ({ ...toFrontendCampaign(dto), isRemoved: Boolean(dto.removed) }))
}

export async function listAdminEvents() {
  const dtos = await adapter.listEvents()
  return dtos.map(toFrontendEvent)
}
