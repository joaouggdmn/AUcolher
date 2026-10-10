import { USE_MOCK_EVENTOS } from '../../../core/utils/constants'
import { maskCEP } from '../../../core/utils/masks'
import { todayLocalIso } from '../../../core/utils/localDate'
import * as eventosApi from './eventosApi'
import * as eventosMock from './eventosMock'

// Fachada do módulo: os componentes só conhecem estas funções e o modelo do
// frontend. Quem fala com o "servidor" é o adaptador — API real ou mock, os
// dois com as mesmas funções e os mesmos DTOs
const adapter = USE_MOCK_EVENTOS ? eventosMock : eventosApi

// ---------- mappers DTO ↔ modelo ----------

// O Spring serializa LocalTime como "09:00:00"; a tela usa "09:00"
function toTime(value) {
  return value ? value.slice(0, 5) : null
}

export function toFrontendEvent(dto) {
  const capacity = dto.capacity ?? null
  const confirmedCount = dto.attendeesCount ?? 0
  const spotsLeft = capacity == null ? null : Math.max(capacity - confirmedCount, 0)

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
    date: dto.date,
    startTime: toTime(dto.startTime),
    endTime: toTime(dto.endTime),
    location: {
      venue: dto.venueName ?? '',
      cep: maskCEP(dto.cep ?? ''),
      street: dto.street ?? '',
      number: dto.number ?? '',
      complement: dto.complement ?? '',
      district: dto.district ?? '',
      city: dto.city ?? '',
      state: dto.state ?? '',
    },
    capacity,
    confirmedCount,
    spotsLeft,
    isFull: spotsLeft === 0,
    isPast: dto.date < todayLocalIso(),
    status: dto.status,
    // null = sem capa; a tela escolhe a imagem padrão da categoria
    coverUrl: dto.coverUrl ?? null,
    createdAt: dto.createdAt ?? null,
    organizer: {
      id: dto.ngo?.id ?? null,
      name: dto.ngo?.name ?? '',
      isVerified: Boolean(dto.ngo?.isVerified),
      photoUrl: dto.ngo?.photoUrl ?? null,
    },
  }
}

function textOrNull(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

// Valores do formulário (mesmo formato do modelo) → corpo de POST/PUT
export function toEventPayload(values) {
  const location = values.location ?? {}
  const capacity = textOrNull(values.capacity)

  return {
    title: textOrNull(values.title),
    description: textOrNull(values.description),
    category: values.category || null,
    date: values.date || null,
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    venueName: textOrNull(location.venue),
    cep: textOrNull(String(location.cep ?? '').replace(/\D/g, '')),
    street: textOrNull(location.street),
    number: textOrNull(location.number),
    complement: textOrNull(location.complement),
    district: textOrNull(location.district),
    city: textOrNull(location.city),
    state: textOrNull(location.state)?.toUpperCase() ?? null,
    capacity: capacity == null ? null : Number(capacity),
    coverUrl: values.coverUrl || null,
  }
}

function toFrontendParticipant(dto) {
  return {
    user: { id: dto.user.id, name: dto.user.name, photoUrl: dto.user.photoUrl ?? null },
    confirmedAt: dto.confirmedAt,
  }
}

// ---------- operações ----------

// As telas falam em ONG (`ongId`); a API, em inglês (`ngoId`)
export async function listEvents({ ongId } = {}) {
  const dtos = await adapter.listEvents({ ngoId: ongId })
  return dtos.map(toFrontendEvent)
}

export async function getEvent(id) {
  return toFrontendEvent(await adapter.getEvent(id))
}

export async function createEvent(values) {
  return toFrontendEvent(await adapter.createEvent(toEventPayload(values)))
}

export async function updateEvent(id, values) {
  return toFrontendEvent(await adapter.updateEvent(id, toEventPayload(values)))
}

export async function deleteEvent(id) {
  await adapter.deleteEvent(id)
}

export async function listMyEvents() {
  const dtos = await adapter.listMyEvents()
  return dtos.map(toFrontendEvent)
}

export async function confirmAttendance(id) {
  return toFrontendEvent(await adapter.confirmAttendance(id))
}

export async function cancelAttendance(id) {
  return toFrontendEvent(await adapter.cancelAttendance(id))
}

export async function listParticipants(id) {
  const dtos = await adapter.listParticipants(id)
  return dtos.map(toFrontendParticipant)
}

export async function listMyAttendance() {
  const dtos = await adapter.listMyAttendance()
  return dtos.map(toFrontendEvent)
}
