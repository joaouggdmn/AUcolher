import {
  createMockStore,
  getMockSession,
  httpUrlOrNull,
  isSameId,
  mockDelay,
  mockHttpError,
  nextId,
} from '../../../core/services/mock/mockStore'
import { MOCK_EVENTOS_STORE_KEY } from '../../../core/utils/storageKeys'
import { addDaysIso, nowLocalIso, todayLocalIso } from '../../../core/utils/localDate'
import { buildSeedEventos, DEMO_ATTENDANCE_EVENT_IDS } from '../data/seedEventos'
import { getEventoPayloadErrors } from '../utils/eventoRules'

// 🔴 Servidor falso de eventos: mesmas funções de eventosApi.js e mesmas
// regras, DTOs e erros do contrato (docs/api-campanhas-eventos.md). Cada
// função espera o "tempo de rede" e depois lê, altera e grava o localStorage
// num bloco síncrono, para duas chamadas nunca se atropelarem
const store = createMockStore({ key: MOCK_EVENTOS_STORE_KEY, version: 1, seed: buildSeedEventos })

const PAYLOAD_FIELDS = [
  'titulo', 'descricao', 'categoria', 'data', 'horaInicio', 'horaFim', 'localNome', 'cep',
  'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'vagas', 'capaUrl',
]

// ---------- helpers do "backend" ----------

function countConfirmed(db, eventoId) {
  return db.presencas.filter((presenca) => isSameId(presenca.eventoId, eventoId)).length
}

// A linha guardada já é o DTO, menos o total — calculado na leitura, como um COUNT
function toDto(db, row) {
  return { ...row, totalConfirmados: countConfirmed(db, row.id) }
}

function byDateAsc(a, b) {
  return a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio)
}

function isPast(row) {
  return row.data < todayLocalIso()
}

function hasAttendance(db, eventoId, userId) {
  return db.presencas.some((presenca) => isSameId(presenca.eventoId, eventoId) && isSameId(presenca.usuario.id, userId))
}

function requireSession() {
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  return user
}

function requireOng(user) {
  if (user.userType !== 'ONG') throw mockHttpError(403, 'Apenas contas de ONG podem gerenciar eventos.')
}

function requireOwner(row, user) {
  if (!isSameId(row.ong.id, user.id)) throw mockHttpError(403, 'Só a ONG que criou o evento pode fazer isso.')
}

// Cancelado é a exclusão lógica: para as rotas comuns ele "não existe" mais
function findActiveRow(db, id) {
  const row = db.eventos.find((evento) => isSameId(evento.id, id))
  if (!row || row.status === 'CANCELADO') throw mockHttpError(404, 'Evento não encontrado.')
  return row
}

// Nas rotas de presença, cancelado vira 400 com o motivo — quem tinha
// confirmado entende por que não consegue mais mexer
function findRowForAttendance(db, id, user) {
  const row = db.eventos.find((evento) => isSameId(evento.id, id))
  if (!row) throw mockHttpError(404, 'Evento não encontrado.')
  if (row.status === 'CANCELADO') throw mockHttpError(400, 'Este evento foi cancelado.')
  if (isPast(row)) throw mockHttpError(400, 'Este evento já aconteceu.')
  if (isSameId(row.ong.id, user.id)) {
    throw mockHttpError(400, 'Você não pode confirmar presença no seu próprio evento.')
  }
  return row
}

// Igual ao Sanitizador do backend: texto aparado, vazio vira null, CEP só com dígitos
function normalizePayload(payload = {}) {
  const normalized = Object.fromEntries(
    PAYLOAD_FIELDS.map((field) => {
      const value = payload[field]
      if (typeof value !== 'string') return [field, value ?? null]
      const trimmed = value.trim()
      return [field, trimmed === '' ? null : trimmed]
    })
  )
  if (normalized.cep) normalized.cep = normalized.cep.replace(/\D/g, '')
  return normalized
}

function validate(payload) {
  const [firstError] = Object.values(getEventoPayloadErrors(payload, todayLocalIso()))
  if (firstError) throw mockHttpError(400, firstError)
}

function ongSnapshot(user) {
  return { id: user.id, nome: user.name, isVerificado: Boolean(user.isVerified), fotoUrl: httpUrlOrNull(user.photoUrl) }
}

function userSnapshot(user) {
  return { id: user.id, nome: user.name, fotoUrl: httpUrlOrNull(user.photoUrl) }
}

// 🔴 Só do mock: na primeira leitura de cada conta, ela ganha presença nos
// eventos de demonstração (um passado e um cancelado) — ver seedEventos.js
function withDemoAttendance(db, user) {
  if (db.demoAttendanceUserIds.some((id) => isSameId(id, user.id))) return db

  const demoRows = db.eventos
    .filter((row) => DEMO_ATTENDANCE_EVENT_IDS.includes(row.id))
    .filter((row) => !isSameId(row.ong.id, user.id) && !hasAttendance(db, row.id, user.id))
    .map((row) => ({ eventoId: row.id, usuario: userSnapshot(user), dataConfirmacao: `${addDaysIso(row.data, -2)}T10:00:00` }))

  const next = {
    ...db,
    presencas: [...db.presencas, ...demoRows],
    demoAttendanceUserIds: [...db.demoAttendanceUserIds, user.id],
  }
  store.write(next)
  return next
}

// ---------- rotas ----------

// GET /api/eventos?ongId= — só ativos de hoje em diante
export async function listEvents({ ongId } = {}) {
  await mockDelay()
  const db = store.read()
  const today = todayLocalIso()

  return db.eventos
    .filter((row) => row.status === 'ATIVO' && row.data >= today)
    .filter((row) => ongId == null || isSameId(row.ong.id, ongId))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}

// GET /api/eventos/{id} — evento passado abre normalmente
export async function getEvent(id) {
  await mockDelay()
  const db = store.read()
  return toDto(db, findActiveRow(db, id))
}

// POST /api/eventos
export async function createEvent(payload) {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const fields = normalizePayload(payload)
  validate(fields)

  const db = store.read()
  const row = { id: nextId(db.eventos), ...fields, status: 'ATIVO', dataCriacao: nowLocalIso(), ong: ongSnapshot(user) }
  store.write({ ...db, eventos: [...db.eventos, row] })
  return toDto(db, row)
}

// PUT /api/eventos/{id}
export async function updateEvent(id, payload) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findActiveRow(db, id)
  requireOwner(row, user)
  if (isPast(row)) throw mockHttpError(400, 'Eventos que já aconteceram não podem ser editados.')

  const fields = normalizePayload(payload)
  validate(fields)
  const confirmed = countConfirmed(db, row.id)
  if (fields.vagas != null && fields.vagas < confirmed) {
    throw mockHttpError(400, `Já existem ${confirmed} presenças confirmadas: as vagas não podem ficar abaixo disso.`)
  }

  const updated = { ...row, ...fields, ong: ongSnapshot(user) }
  store.write({ ...db, eventos: db.eventos.map((evento) => (evento.id === row.id ? updated : evento)) })
  return toDto(db, updated)
}

// DELETE /api/eventos/{id} — real sem confirmados; com confirmados vira
// CANCELADO, e quem confirmou ainda vê o evento em Minha conta
export async function deleteEvent(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findActiveRow(db, id)
  requireOwner(row, user)
  if (isPast(row)) throw mockHttpError(400, 'Eventos que já aconteceram não podem ser excluídos.')

  const eventos =
    countConfirmed(db, row.id) === 0
      ? db.eventos.filter((evento) => evento.id !== row.id)
      : db.eventos.map((evento) => (evento.id === row.id ? { ...evento, status: 'CANCELADO' } : evento))
  store.write({ ...db, eventos })
}

// GET /api/usuarios/me/eventos
export async function listMyEvents() {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()

  return db.eventos
    .filter((row) => row.status === 'ATIVO' && isSameId(row.ong.id, user.id))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}

// POST /api/eventos/{id}/presencas — idempotente
export async function confirmAttendance(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findRowForAttendance(db, id, user)
  if (hasAttendance(db, row.id, user.id)) return toDto(db, row)

  if (row.vagas != null && countConfirmed(db, row.id) >= row.vagas) {
    throw mockHttpError(400, 'Vagas esgotadas para este evento.')
  }

  const next = {
    ...db,
    presencas: [...db.presencas, { eventoId: row.id, usuario: userSnapshot(user), dataConfirmacao: nowLocalIso() }],
  }
  store.write(next)
  return toDto(next, row)
}

// DELETE /api/eventos/{id}/presencas — idempotente
export async function cancelAttendance(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findRowForAttendance(db, id, user)

  const next = {
    ...db,
    presencas: db.presencas.filter(
      (presenca) => !(isSameId(presenca.eventoId, row.id) && isSameId(presenca.usuario.id, user.id))
    ),
  }
  store.write(next)
  return toDto(next, row)
}

// GET /api/eventos/{id}/presencas — só a ONG dona
export async function listParticipants(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findActiveRow(db, id)
  requireOwner(row, user)

  return db.presencas
    .filter((presenca) => isSameId(presenca.eventoId, row.id))
    .sort((a, b) => a.dataConfirmacao.localeCompare(b.dataConfirmacao))
    .map(({ usuario, dataConfirmacao }) => ({ usuario, dataConfirmacao }))
}

// GET /api/usuarios/me/presencas — inclui passados e cancelados
export async function listMyAttendance() {
  await mockDelay()
  const user = requireSession()
  const db = withDemoAttendance(store.read(), user)

  return db.eventos
    .filter((row) => hasAttendance(db, row.id, user.id))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}
