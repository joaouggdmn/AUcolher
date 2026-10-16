import {
  createMockStore,
  getMockSession,
  httpUrlOrNull,
  isSameId,
  mockDelay,
  mockHttpError,
  nextId,
} from '../../../core/services/mock/mockStore'
import { MOCK_DENUNCIAS_STORE_KEY } from '../../../core/utils/storageKeys'
import { nowLocalIso } from '../../../core/utils/localDate'
import { buildSeedDenuncias } from '../data/seedDenuncias'
import { getReportPayloadErrors, reportTargetKey } from '../utils/reportRules'

// 🔴 Servidor falso das denúncias: mesmas funções de denunciasApi.js e as
// regras, DTOs e erros do contrato (docs/contratos-prontos/api-denuncias-moderacao.md §1). Cada função espera
// o "tempo de rede" e depois lê, altera e grava o localStorage num bloco só
const store = createMockStore({ key: MOCK_DENUNCIAS_STORE_KEY, version: 1, seed: buildSeedDenuncias })

// ---------- helpers do "backend" ----------

function requireSession() {
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  return user
}

function byNewest(field) {
  return (a, b) => (b[field] ?? '').localeCompare(a[field] ?? '')
}

function toApiUserType(userType) {
  if (userType === 'ONG' || userType === 'NGO') return 'NGO'
  return userType === 'ADMIN' ? 'ADMIN' : 'PERSON'
}

// O backend tira a cópia do alvo do banco; o mock guarda a que a tela montou,
// só com foto por URL (um data URL por linha estouraria o localStorage)
function toTargetSnapshot(target = {}) {
  return {
    name: target.name ?? '',
    photoUrl: httpUrlOrNull(target.photoUrl),
    userType: target.userType ?? null,
    city: target.city ?? null,
    state: target.state ?? null,
    species: target.species ?? null,
    ownerId: target.ownerId ?? null,
    ownerName: target.ownerName ?? null,
    ownerUserType: target.ownerUserType ?? null,
  }
}

function reporterSnapshot(user) {
  return {
    id: user.id,
    name: user.name,
    photoUrl: httpUrlOrNull(user.photoUrl),
    userType: toApiUserType(user.userType),
  }
}

// O que a conta logada vê das próprias denúncias (sem `reporter`, que é ela)
function toDto(row) {
  return {
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    target: row.target,
    reason: row.reason,
    description: row.description,
    status: row.status,
    resolution: row.resolution,
    createdAt: row.createdAt,
    resolvedAt: row.resolvedAt,
  }
}

function normalizePayload(payload = {}) {
  const description = String(payload.description ?? '').trim()
  return {
    targetType: payload.targetType,
    targetId: payload.targetId ?? null,
    reason: payload.reason,
    description: description === '' ? null : description,
  }
}

function isOwnContent(fields, target, user) {
  if (fields.targetType === 'USER') return isSameId(fields.targetId, user.id)
  return isSameId(target.ownerId, user.id)
}

// ---------- rotas ----------

// POST /api/reports — 201 com a denúncia criada
export async function createReport(payload, { target } = {}) {
  await mockDelay()
  const user = requireSession()
  if (user.userType === 'ADMIN') {
    throw mockHttpError(403, 'Contas de admin não fazem denúncias: a moderação é feita pelo painel.')
  }

  const fields = normalizePayload(payload)
  const [firstError] = Object.values(getReportPayloadErrors(fields))
  if (firstError) throw mockHttpError(400, firstError)
  if (fields.targetId == null) throw mockHttpError(400, 'Não é possível denunciar este conteúdo.')

  const snapshot = toTargetSnapshot(target)
  const isAnimal = fields.targetType === 'ANIMAL'
  if (isOwnContent(fields, snapshot, user)) {
    throw mockHttpError(
      400,
      isAnimal ? 'Você não pode denunciar o seu próprio anúncio.' : 'Você não pode denunciar o seu próprio perfil.'
    )
  }

  // Uma denúncia em análise por pessoa e alvo
  const db = store.read()
  const key = reportTargetKey({ ...fields, target: snapshot })
  const alreadyOpen = db.reports.some(
    (row) => row.status === 'PENDING' && isSameId(row.reporter.id, user.id) && reportTargetKey(row) === key
  )
  if (alreadyOpen) {
    throw mockHttpError(
      409,
      isAnimal
        ? 'Você já denunciou este anúncio. A denúncia está em análise.'
        : 'Você já denunciou este perfil. A denúncia está em análise.'
    )
  }

  const row = {
    id: nextId(db.reports),
    ...fields,
    target: snapshot,
    status: 'PENDING',
    resolution: null,
    createdAt: nowLocalIso(),
    resolvedAt: null,
    reporter: reporterSnapshot(user),
  }
  store.write({ ...db, reports: [...db.reports, row] })
  return toDto(row)
}

// GET /api/reports/mine — as denúncias da conta logada, mais recentes primeiro
export async function listMyReports() {
  await mockDelay()
  const user = requireSession()
  const db = store.read()

  return db.reports
    .filter((row) => isSameId(row.reporter.id, user.id))
    .sort(byNewest('createdAt'))
    .map(toDto)
}

// ---------- só do mock: leituras e escritas do painel do admin (features/admin) ----------

// O admin vê também quem denunciou
function toAdminDto(row) {
  return { ...toDto(row), reporter: row.reporter }
}

// Todas as denúncias, das mais recentes para as mais antigas. Síncronas e
// sem latência: o servidor falso do admin (adminMock) as junta às rotas
// dele, como um JOIN no banco
export function readAllReportsForAdmin() {
  return [...store.read().reports].sort(byNewest('createdAt')).map(toAdminDto)
}

export function findReportForAdmin(id) {
  const row = store.read().reports.find((report) => isSameId(report.id, id))
  return row ? toAdminDto(row) : null
}

// Julga de uma vez as denúncias pendentes que `matches` aceitar (as do mesmo
// alvo, ou tudo o que envolve uma conta banida). Devolve as que mudaram
export function resolvePendingReportsForAdmin(matches, resolution) {
  const db = store.read()
  const resolvedAt = nowLocalIso()
  const resolved = []

  const reports = db.reports.map((row) => {
    if (row.status !== 'PENDING' || !matches(row)) return row
    const updated = { ...row, status: 'RESOLVED', resolution, resolvedAt }
    resolved.push(updated)
    return updated
  })
  if (resolved.length > 0) store.write({ ...db, reports })
  return resolved.map(toAdminDto)
}
