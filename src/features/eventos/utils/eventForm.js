import { todayLocalIso } from '../../../core/utils/localDate'
import { toEventPayload } from '../services/eventoService'
import { getEventPayloadErrors } from './eventoRules'

// Estado do formulário de evento: mesmo formato do modelo (é o que
// toEventPayload espera), mais `limitCapacity`, que só existe na tela
const EMPTY_LOCATION = { venue: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '' }

// Evento novo já nasce na cidade da ONG — é onde a maioria acontece
export function buildNewEventForm(user) {
  return {
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: {
      ...EMPTY_LOCATION,
      city: user?.address?.city || user?.cidade || '',
      state: user?.address?.state || user?.estado || '',
    },
    limitCapacity: false,
    capacity: '',
    coverUrl: null,
  }
}

export function buildEventForm(event) {
  return {
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    startTime: event.startTime ?? '',
    endTime: event.endTime ?? '',
    location: { ...EMPTY_LOCATION, ...event.location },
    limitCapacity: event.capacity != null,
    capacity: event.capacity != null ? String(event.capacity) : '',
    coverUrl: event.coverUrl,
  }
}

// Chave do DTO → campo do formulário (a maioria tem o mesmo nome)
const FIELD_BY_PAYLOAD_KEY = {
  title: 'title',
  category: 'category',
  description: 'description',
  date: 'date',
  startTime: 'startTime',
  endTime: 'endTime',
  venueName: 'venue',
  cep: 'cep',
  number: 'number',
  street: 'street',
  district: 'district',
  complement: 'complement',
  city: 'city',
  state: 'state',
  coverUrl: 'coverUrl',
  capacity: 'capacity',
}

// Ordem visual dos campos: o primeiro com erro recebe o foco
export const EVENT_FORM_FIELDS = Object.values(FIELD_BY_PAYLOAD_KEY)

export function eventFieldId(field) {
  return `event-field-${field}`
}

// As mesmas regras que o backend aplica (eventoRules), agora por campo, mais
// as que só o formulário conhece: vagas ligadas sem número e, na edição,
// vagas abaixo de quem já confirmou
export function getEventFormErrors(values, { minCapacity = 0 } = {}) {
  const payloadErrors = getEventPayloadErrors(toEventPayload(values), todayLocalIso())
  const errors = Object.fromEntries(
    Object.entries(payloadErrors).map(([key, message]) => [FIELD_BY_PAYLOAD_KEY[key], message])
  )

  if (values.limitCapacity && !errors.capacity) {
    if (String(values.capacity).trim() === '') {
      errors.capacity = 'Informe quantas vagas o evento tem.'
    } else if (Number(values.capacity) < minCapacity) {
      errors.capacity = `Já existem ${minCapacity} presenças confirmadas: o mínimo é ${minCapacity}.`
    }
  }

  return errors
}
