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
import { getEventPayloadErrors } from '../utils/eventoRules'

// 🔴 Servidor falso de eventos: mesmas funções de eventosApi.js e mesmas
// regras, DTOs e erros do contrato (docs/api-campanhas-eventos.md). Cada
// função espera o "tempo de rede" e depois lê, altera e grava o localStorage
// num bloco síncrono, para duas chamadas nunca se atropelarem.
// Versão 2: contrato em inglês — os dados da versão 1 são descartados
const store = createMockStore({ key: MOCK_EVENTOS_STORE_KEY, version: 2, seed: buildSeedEventos })

const PAYLOAD_FIELDS = [
  'title', 'description', 'category', 'date', 'startTime', 'endTime', 'venueName', 'cep',
  'street', 'number', 'complement', 'district', 'city', 'state', 'capacity', 'coverUrl',
]

// ---------- helpers do "backend" ----------

function countConfirmed(db, eventId) {
  return db.attendances.filter((attendance) => isSameId(attendance.eventId, eventId)).length
}

// A linha guardada já é o DTO, menos o total — calculado na leitura, como um COUNT
function toDto(db, row) {
  return { ...row, attendeesCount: countConfirmed(db, row.id) }
}

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
}

function isPast(row) {
  return row.date < todayLocalIso()
}

function hasAttendance(db, eventId, userId) {
  return db.attendances.some((attendance) => isSameId(attendance.eventId, eventId) && isSameId(attendance.user.id, userId))
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
  if (!isSameId(row.ngo.id, user.id)) throw mockHttpError(403, 'Só a ONG que criou o evento pode fazer isso.')
}

// Cancelado é a exclusão lógica: para as rotas comuns ele "não existe" mais
function findActiveRow(db, id) {
  const row = db.events.find((event) => isSameId(event.id, id))
  if (!row || row.status === 'CANCELLED') throw mockHttpError(404, 'Evento não encontrado.')
  return row
}

// Nas rotas de presença, cancelado vira 400 com o motivo — quem tinha
// confirmado entende por que não consegue mais mexer
function findRowForAttendance(db, id, user) {
  const row = db.events.find((event) => isSameId(event.id, id))
  if (!row) throw mockHttpError(404, 'Evento não encontrado.')
  if (row.status === 'CANCELLED') throw mockHttpError(400, 'Este evento foi cancelado.')
  if (isPast(row)) throw mockHttpError(400, 'Este evento já aconteceu.')
  if (isSameId(row.ngo.id, user.id)) {
    throw mockHttpError(400, 'Você não pode confirmar presença no seu próprio evento.')
  }
  return row
}

// Igual ao Sanitizer do backend: texto aparado, vazio vira null, CEP só com dígitos
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
  const [firstError] = Object.values(getEventPayloadErrors(payload, todayLocalIso()))
  if (firstError) throw mockHttpError(400, firstError)
}

function ngoSnapshot(user) {
  return { id: user.id, name: user.name, isVerified: Boolean(user.isVerified), photoUrl: httpUrlOrNull(user.photoUrl) }
}

function userSnapshot(user) {
  return { id: user.id, name: user.name, photoUrl: httpUrlOrNull(user.photoUrl) }
}

// 🔴 Só do mock: na primeira leitura de cada conta, ela ganha presença nos
// eventos de demonstração (um passado e um cancelado) — ver seedEventos.js
function withDemoAttendance(db, user) {
  if (db.demoAttendanceUserIds.some((id) => isSameId(id, user.id))) return db

  const demoRows = db.events
    .filter((row) => DEMO_ATTENDANCE_EVENT_IDS.includes(row.id))
    .filter((row) => !isSameId(row.ngo.id, user.id) && !hasAttendance(db, row.id, user.id))
    .map((row) => ({ eventId: row.id, user: userSnapshot(user), confirmedAt: `${addDaysIso(row.date, -2)}T10:00:00` }))

  const next = {
    ...db,
    attendances: [...db.attendances, ...demoRows],
    demoAttendanceUserIds: [...db.demoAttendanceUserIds, user.id],
  }
  store.write(next)
  return next
}

// ---------- rotas ----------

// GET /api/events?ngoId= — só ativos de hoje em diante
export async function listEvents({ ngoId } = {}) {
  await mockDelay()
  const db = store.read()
  const today = todayLocalIso()

  return db.events
    .filter((row) => row.status === 'ACTIVE' && row.date >= today)
    .filter((row) => ngoId == null || isSameId(row.ngo.id, ngoId))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}

// GET /api/events/{id} — evento passado abre normalmente
export async function getEvent(id) {
  await mockDelay()
  const db = store.read()
  return toDto(db, findActiveRow(db, id))
}

// POST /api/events
export async function createEvent(payload) {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const fields = normalizePayload(payload)
  validate(fields)

  const db = store.read()
  const row = { id: nextId(db.events), ...fields, status: 'ACTIVE', createdAt: nowLocalIso(), ngo: ngoSnapshot(user) }
  store.write({ ...db, events: [...db.events, row] })
  return toDto(db, row)
}

// PUT /api/events/{id}
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
  if (fields.capacity != null && fields.capacity < confirmed) {
    throw mockHttpError(400, `Já existem ${confirmed} presenças confirmadas: as vagas não podem ficar abaixo disso.`)
  }

  const updated = { ...row, ...fields, ngo: ngoSnapshot(user) }
  store.write({ ...db, events: db.events.map((event) => (event.id === row.id ? updated : event)) })
  return toDto(db, updated)
}

// DELETE /api/events/{id} — real sem confirmados; com confirmados vira
// CANCELLED, e quem confirmou ainda vê o evento em Minha conta
export async function deleteEvent(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findActiveRow(db, id)
  requireOwner(row, user)
  if (isPast(row)) throw mockHttpError(400, 'Eventos que já aconteceram não podem ser excluídos.')

  const events =
    countConfirmed(db, row.id) === 0
      ? db.events.filter((event) => event.id !== row.id)
      : db.events.map((event) => (event.id === row.id ? { ...event, status: 'CANCELLED' } : event))
  store.write({ ...db, events })
}

// GET /api/events/mine
export async function listMyEvents() {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()

  return db.events
    .filter((row) => row.status === 'ACTIVE' && isSameId(row.ngo.id, user.id))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}

// POST /api/events/{id}/attendance — idempotente
export async function confirmAttendance(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findRowForAttendance(db, id, user)
  if (hasAttendance(db, row.id, user.id)) return toDto(db, row)

  if (row.capacity != null && countConfirmed(db, row.id) >= row.capacity) {
    throw mockHttpError(400, 'Vagas esgotadas para este evento.')
  }

  const next = {
    ...db,
    attendances: [...db.attendances, { eventId: row.id, user: userSnapshot(user), confirmedAt: nowLocalIso() }],
  }
  store.write(next)
  return toDto(next, row)
}

// DELETE /api/events/{id}/attendance — idempotente
export async function cancelAttendance(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findRowForAttendance(db, id, user)

  const next = {
    ...db,
    attendances: db.attendances.filter(
      (attendance) => !(isSameId(attendance.eventId, row.id) && isSameId(attendance.user.id, user.id))
    ),
  }
  store.write(next)
  return toDto(next, row)
}

// GET /api/events/{id}/attendees — só a ONG dona
export async function listParticipants(id) {
  await mockDelay()
  const user = requireSession()
  const db = store.read()
  const row = findActiveRow(db, id)
  requireOwner(row, user)

  return db.attendances
    .filter((attendance) => isSameId(attendance.eventId, row.id))
    .sort((a, b) => a.confirmedAt.localeCompare(b.confirmedAt))
    .map(({ user: attendee, confirmedAt }) => ({ user: attendee, confirmedAt }))
}

// GET /api/events/attending — inclui passados e cancelados
export async function listMyAttendance() {
  await mockDelay()
  const user = requireSession()
  const db = withDemoAttendance(store.read(), user)

  return db.events
    .filter((row) => hasAttendance(db, row.id, user.id))
    .sort(byDateAsc)
    .map((row) => toDto(db, row))
}

// ---------- só do mock: dados de teste do painel (features/ong/panel/dev) ----------

// Grava eventos da ONG logada já com as presenças. As linhas ficam marcadas
// com `demo: true` para removeDemoEvents apagar só elas
export async function insertDemoEvents(templates) {
  await mockDelay()
  const user = requireSession()
  requireOng(user)
  const db = store.read()

  let id = nextId(db.events)
  const events = []
  const attendances = []
  for (const { attendees, ...fields } of templates) {
    const event = { ...fields, id: id++, status: 'ACTIVE', ngo: ngoSnapshot(user), demo: true }
    events.push(event)
    attendances.push(...attendees.map(({ user: attendee, confirmedAt }) => ({ eventId: event.id, user: attendee, confirmedAt })))
  }
  store.write({ ...db, events: [...db.events, ...events], attendances: [...db.attendances, ...attendances] })
}

export async function removeDemoEvents() {
  await mockDelay()
  const db = store.read()
  const demoIds = new Set(db.events.filter((row) => row.demo).map((row) => row.id))
  store.write({
    ...db,
    events: db.events.filter((row) => !row.demo),
    attendances: db.attendances.filter((attendance) => !demoIds.has(attendance.eventId)),
  })
}
