import { httpUrlOrNull } from '../../../core/services/mock/mockStore'
import { USE_MOCK_DENUNCIAS } from '../../../core/utils/constants'
import * as denunciasApi from './denunciasApi'
import * as denunciasMock from './denunciasMock'

// Fachada das denúncias: as telas só conhecem estas funções e o modelo do
// frontend. Quem fala com o "servidor" é o adaptador — API real ou mock, os
// dois com as mesmas funções e os mesmos DTOs
const adapter = USE_MOCK_DENUNCIAS ? denunciasMock : denunciasApi

const FRONTEND_USER_TYPES = { NGO: 'ONG', PERSON: 'PESSOA', ADMIN: 'ADMIN' }
const API_USER_TYPES = { ONG: 'NGO', PESSOA: 'PERSON' }

// ---------- mappers ----------

// Cópia do alvo que só o mock usa (o backend monta a dele a partir do banco),
// tirada do animal ou do perfil como as telas já têm
function animalTarget(animal) {
  return {
    name: animal.name,
    photoUrl: httpUrlOrNull(animal.photoUrl),
    species: animal.species ?? null,
    ownerId: animal.ownerId ?? null,
    ownerName: animal.organizationName ?? animal.ownerName ?? null,
    ownerUserType: animal.listingType === 'NGO' ? 'NGO' : 'PERSON',
  }
}

function profileTarget(profile) {
  return {
    name: profile.name,
    photoUrl: httpUrlOrNull(profile.photoUrl),
    userType: API_USER_TYPES[profile.userType] ?? 'PERSON',
    city: profile.city ?? null,
    state: profile.state ?? null,
  }
}

export function toFrontendReport(dto) {
  const target = dto.target ?? {}

  return {
    id: dto.id,
    targetType: dto.targetType,
    targetId: dto.targetId,
    target: {
      name: target.name ?? '',
      photoUrl: target.photoUrl ?? null,
      userType: FRONTEND_USER_TYPES[target.userType] ?? null,
      city: target.city ?? '',
      state: target.state ?? '',
      species: target.species ?? null,
      ownerId: target.ownerId ?? null,
      ownerName: target.ownerName ?? '',
      ownerUserType: FRONTEND_USER_TYPES[target.ownerUserType] ?? null,
    },
    reason: dto.reason,
    description: dto.description ?? '',
    status: dto.status,
    isPending: dto.status === 'PENDING',
    resolution: dto.resolution ?? null,
    createdAt: dto.createdAt,
    resolvedAt: dto.resolvedAt ?? null,
    // Só vem na lista do admin
    reporter: dto.reporter
      ? {
          id: dto.reporter.id,
          name: dto.reporter.name,
          photoUrl: dto.reporter.photoUrl ?? null,
          userType: FRONTEND_USER_TYPES[dto.reporter.userType] ?? 'PESSOA',
        }
      : null,
  }
}

// ---------- operações ----------

// `target` é o animal (targetType ANIMAL) ou o perfil público (USER)
export async function createReport({ targetType, target, reason, description }) {
  const payload = { targetType, targetId: target.id, reason, description: description?.trim() || null }
  const snapshot = targetType === 'ANIMAL' ? animalTarget(target) : profileTarget(target)
  return toFrontendReport(await adapter.createReport(payload, { target: snapshot }))
}

export async function listMyReports() {
  const dtos = await adapter.listMyReports()
  return dtos.map(toFrontendReport)
}
