import * as denunciasApi from './denunciasApi'

// Fachada das denúncias: as telas só conhecem estas funções e o modelo do
// frontend. Quem fala com o servidor é o denunciasApi (DTOs da API)

const FRONTEND_USER_TYPES = { NGO: 'ONG', PERSON: 'PESSOA', ADMIN: 'ADMIN' }

// ---------- mappers ----------

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

// `target` é o animal (targetType ANIMAL) ou o perfil público (USER). O
// backend monta a cópia do alvo a partir do banco: basta o id
export async function createReport({ targetType, target, reason, description }) {
  const payload = { targetType, targetId: target.id, reason, description: description?.trim() || null }
  return toFrontendReport(await denunciasApi.createReport(payload))
}

export async function listMyReports() {
  const dtos = await denunciasApi.listMyReports()
  return dtos.map(toFrontendReport)
}
