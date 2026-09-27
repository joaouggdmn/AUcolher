import { USE_MOCK_EVENTOS } from '../../../core/utils/constants'
import { maskCEP } from '../../../core/utils/masks'
import { todayLocalIso } from '../../../core/utils/localDate'
import * as eventosApi from './eventosApi'
import * as eventosMock from './eventosMock'

// Fachada do módulo: os componentes só conhecem estas funções e o modelo do
// frontend (nomes em inglês). Quem fala com o "servidor" é o adaptador — API
// real ou mock, os dois com as mesmas funções e os mesmos DTOs
const adapter = USE_MOCK_EVENTOS ? eventosMock : eventosApi

// ---------- mappers DTO ↔ modelo ----------

// O Spring serializa LocalTime como "09:00:00"; a tela usa "09:00"
function toTime(value) {
  return value ? value.slice(0, 5) : null
}

export function toFrontendEvent(dto) {
  const capacity = dto.vagas ?? null
  const confirmedCount = dto.totalConfirmados ?? 0
  const spotsLeft = capacity == null ? null : Math.max(capacity - confirmedCount, 0)

  return {
    id: dto.id,
    title: dto.titulo,
    description: dto.descricao ?? '',
    category: dto.categoria,
    date: dto.data,
    startTime: toTime(dto.horaInicio),
    endTime: toTime(dto.horaFim),
    location: {
      venue: dto.localNome ?? '',
      cep: maskCEP(dto.cep ?? ''),
      street: dto.logradouro ?? '',
      number: dto.numero ?? '',
      complement: dto.complemento ?? '',
      district: dto.bairro ?? '',
      city: dto.cidade ?? '',
      state: dto.estado ?? '',
    },
    capacity,
    confirmedCount,
    spotsLeft,
    isFull: spotsLeft === 0,
    isPast: dto.data < todayLocalIso(),
    status: dto.status,
    // null = sem capa; a tela escolhe a imagem padrão da categoria
    coverUrl: dto.capaUrl ?? null,
    createdAt: dto.dataCriacao ?? null,
    organizer: {
      id: dto.ong?.id ?? null,
      name: dto.ong?.nome ?? '',
      isVerified: Boolean(dto.ong?.isVerificado),
      photoUrl: dto.ong?.fotoUrl ?? null,
    },
  }
}

function textOrNull(value) {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

// Valores do formulário (mesmo formato do modelo) → corpo de POST/PUT
export function toEventoPayload(values) {
  const location = values.location ?? {}
  const capacity = textOrNull(values.capacity)

  return {
    titulo: textOrNull(values.title),
    descricao: textOrNull(values.description),
    categoria: values.category || null,
    data: values.date || null,
    horaInicio: values.startTime || null,
    horaFim: values.endTime || null,
    localNome: textOrNull(location.venue),
    cep: textOrNull(String(location.cep ?? '').replace(/\D/g, '')),
    logradouro: textOrNull(location.street),
    numero: textOrNull(location.number),
    complemento: textOrNull(location.complement),
    bairro: textOrNull(location.district),
    cidade: textOrNull(location.city),
    estado: textOrNull(location.state)?.toUpperCase() ?? null,
    vagas: capacity == null ? null : Number(capacity),
    capaUrl: values.coverUrl || null,
  }
}

function toFrontendParticipant(dto) {
  return {
    user: { id: dto.usuario.id, name: dto.usuario.nome, photoUrl: dto.usuario.fotoUrl ?? null },
    confirmedAt: dto.dataConfirmacao,
  }
}

// ---------- operações ----------

export async function listEvents({ ongId } = {}) {
  const dtos = await adapter.listEvents({ ongId })
  return dtos.map(toFrontendEvent)
}

export async function getEvent(id) {
  return toFrontendEvent(await adapter.getEvent(id))
}

export async function createEvent(values) {
  return toFrontendEvent(await adapter.createEvent(toEventoPayload(values)))
}

export async function updateEvent(id, values) {
  return toFrontendEvent(await adapter.updateEvent(id, toEventoPayload(values)))
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
