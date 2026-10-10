import { EVENT_COVER_MAX_LENGTH } from '../../../core/utils/constants'

export const EVENT_CATEGORIES = ['ADOPTION_FAIR', 'HEALTH', 'BAZAAR', 'WORKSHOP']

export const EVENT_LIMITS = {
  title: { min: 3, max: 120 },
  description: 2000,
  venueName: 120,
  street: 150,
  number: 20,
  complement: 100,
  district: 100,
  city: 100,
}

const COVER_URL_FORMAT = /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/

function tooLong(value, max) {
  return value != null && value.length > max
}

// Regras do corpo de POST/PUT /api/events (docs/api-campanhas-eventos.md
// §2.2), campo a campo, com as chaves do DTO. O mock devolve a primeira como
// erro 400, igual ao backend; o formulário pode mostrar todas
export function getEventPayloadErrors(payload, today) {
  const errors = {}
  const { title, description, date, startTime, endTime, capacity, coverUrl } = payload

  if (!title || title.length < EVENT_LIMITS.title.min || title.length > EVENT_LIMITS.title.max) {
    errors.title = `O título deve ter entre ${EVENT_LIMITS.title.min} e ${EVENT_LIMITS.title.max} caracteres.`
  }
  if (!description) errors.description = 'Descreva o evento.'
  else if (tooLong(description, EVENT_LIMITS.description)) {
    errors.description = `A descrição pode ter no máximo ${EVENT_LIMITS.description} caracteres.`
  }
  if (!EVENT_CATEGORIES.includes(payload.category)) errors.category = 'Escolha uma categoria.'

  if (!date) errors.date = 'Informe a data do evento.'
  else if (date < today) errors.date = 'A data do evento não pode estar no passado.'
  if (!startTime) errors.startTime = 'Informe o horário de início.'
  if (startTime && endTime && endTime <= startTime) errors.endTime = 'O término deve ser depois do início.'

  if (!payload.venueName) errors.venueName = 'Informe o nome do local.'
  else if (tooLong(payload.venueName, EVENT_LIMITS.venueName)) errors.venueName = 'Nome do local muito longo.'
  if (!payload.street) errors.street = 'Informe o endereço.'
  else if (tooLong(payload.street, EVENT_LIMITS.street)) errors.street = 'Endereço muito longo.'
  if (!payload.city) errors.city = 'Informe a cidade.'
  else if (tooLong(payload.city, EVENT_LIMITS.city)) errors.city = 'Nome da cidade muito longo.'
  if (!/^[A-Z]{2}$/.test(payload.state ?? '')) errors.state = 'Selecione o estado.'
  if (payload.cep != null && !/^\d{8}$/.test(payload.cep)) errors.cep = 'O CEP deve ter 8 dígitos.'
  if (tooLong(payload.number, EVENT_LIMITS.number)) errors.number = 'Número muito longo.'
  if (tooLong(payload.complement, EVENT_LIMITS.complement)) errors.complement = 'Complemento muito longo.'
  if (tooLong(payload.district, EVENT_LIMITS.district)) errors.district = 'Nome do bairro muito longo.'

  if (capacity != null && (!Number.isInteger(capacity) || capacity < 1)) {
    errors.capacity = 'As vagas devem ser um número inteiro maior que zero.'
  }
  if (coverUrl != null) {
    if (!COVER_URL_FORMAT.test(coverUrl)) errors.coverUrl = 'Formato de imagem não suportado.'
    else if (coverUrl.length > EVENT_COVER_MAX_LENGTH) errors.coverUrl = 'A imagem da capa é grande demais.'
  }

  return errors
}
