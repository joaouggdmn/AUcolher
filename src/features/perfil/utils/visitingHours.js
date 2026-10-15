// Horário de visitas da ONG. O banco guarda texto (ngo_visiting_hours: `days`
// e `hours`, ex.: "Terça a sexta" / "14h às 18h"); "Minha conta" edita com
// dias marcados e horas de abrir/fechar, e monta o texto de volta aqui.
// O formulário guarda { byAppointment, slots: [{ days, opensAt, closesAt, legacy }] }:
//   days      → índices de WEEKDAYS (0 = segunda … 6 = domingo)
//   opensAt / closesAt → "HH:MM", o formato do <input type="time">
//   legacy    → a linha original, quando o texto não deu para ler

export const WEEKDAYS = [
  { short: 'Seg', name: 'segunda' },
  { short: 'Ter', name: 'terça' },
  { short: 'Qua', name: 'quarta' },
  { short: 'Qui', name: 'quinta' },
  { short: 'Sex', name: 'sexta' },
  { short: 'Sáb', name: 'sábado' },
  { short: 'Dom', name: 'domingo' },
]

export const MAX_VISITING_SLOTS = 7

// Visitas só com hora marcada: uma linha fixa no lugar das faixas
export const BY_APPOINTMENT_SLOT = { days: 'Somente com agendamento', hours: 'Combine pelo contato' }

export const EMPTY_SLOT = { days: [], opensAt: '09:00', closesAt: '17:00', legacy: null }

const ALL_DAYS = WEEKDAYS.map((_, index) => index)

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// "terça", "Terças", "terca-feira" → 1
function stripAccents(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function dayIndex(word) {
  const normalized = stripAccents(word.trim().toLowerCase())
    .replace(/-feiras?$/, '')
    .replace(/s$/, '')
  const index = WEEKDAYS.findIndex((day) => stripAccents(day.name) === normalized)
  return index === -1 ? null : index
}

function joinWithE(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`
}

// [1,2,3,4] → "Terça a sexta"; [0,2,4] → "Segunda, quarta e sexta";
// [0,1,2,4] → "Segunda a quarta e sexta". Sequência de 3 ou mais vira "a"
export function formatDays(days) {
  const sorted = [...new Set(days)].sort((a, b) => a - b)
  if (sorted.length === 0) return ''
  if (sorted.length === ALL_DAYS.length) return 'Todos os dias'
  if (sorted.length === 2 && sorted[0] === 5 && sorted[1] === 6) return 'Sábados e domingos'

  const runs = []
  sorted.forEach((day) => {
    const lastRun = runs[runs.length - 1]
    if (lastRun && day === lastRun[lastRun.length - 1] + 1) lastRun.push(day)
    else runs.push([day])
  })

  const items = runs.flatMap((run) =>
    run.length >= 3
      ? [`${WEEKDAYS[run[0]].name} a ${WEEKDAYS[run[run.length - 1]].name}`]
      : run.map((day) => WEEKDAYS[day].name)
  )
  return capitalize(joinWithE(items))
}

// O inverso do formatDays, aceitando plural e "-feira". null = não deu para ler
export function parseDays(text) {
  const normalized = (text ?? '').trim().toLowerCase()
  if (!normalized) return null
  if (normalized === 'todos os dias') return [...ALL_DAYS]

  const days = []
  for (const part of normalized.split(/\s*,\s*|\s+e\s+/)) {
    const bounds = part.split(/\s+a\s+/)
    if (bounds.length > 2) return null
    const start = dayIndex(bounds[0])
    const end = bounds.length === 2 ? dayIndex(bounds[1]) : start
    if (start == null || end == null || end < start) return null
    for (let day = start; day <= end; day++) days.push(day)
  }
  return [...new Set(days)].sort((a, b) => a - b)
}

// "08:30" → "8h30"; "12:00" → "12h"
function formatTime(time) {
  const [hours, minutes] = time.split(':')
  return `${Number(hours)}h${minutes === '00' ? '' : minutes}`
}

export function formatHours(opensAt, closesAt) {
  if (!opensAt || !closesAt) return ''
  return `${formatTime(opensAt)} às ${formatTime(closesAt)}`
}

// "9h30 às 12h" → { opensAt: "09:30", closesAt: "12:00" }
const HOURS_PATTERN = /^(\d{1,2})h(\d{2})?\s*(?:às|as|-|a)\s*(\d{1,2})h(\d{2})?$/i

function toTime(hours, minutes = '00') {
  if (Number(hours) > 23 || Number(minutes) > 59) return null
  return `${hours.padStart(2, '0')}:${minutes}`
}

export function parseHours(text) {
  const match = (text ?? '').trim().match(HOURS_PATTERN)
  if (!match) return null
  const opensAt = toTime(match[1], match[2])
  const closesAt = toTime(match[3], match[4])
  return opensAt && closesAt ? { opensAt, closesAt } : null
}

// Linhas da API → estado do formulário
export function toVisitingHoursForm(rows = []) {
  const isByAppointment =
    rows.length === 1 && rows[0].days?.trim().toLowerCase() === BY_APPOINTMENT_SLOT.days.toLowerCase()
  if (isByAppointment) return { byAppointment: true, slots: [] }

  return {
    byAppointment: false,
    slots: rows.map((row) => {
      const days = parseDays(row.days)
      const hours = parseHours(row.hours)
      return days && hours ? { days, ...hours, legacy: null } : { ...EMPTY_SLOT, legacy: { days: row.days, hours: row.hours } }
    }),
  }
}

// Estado do formulário → linhas da API. Linha sem dia marcado: se veio de um
// texto que não deu para ler, segue como estava; se é nova, é descartada
export function toVisitingHourRows({ byAppointment, slots }) {
  if (byAppointment) return [BY_APPOINTMENT_SLOT]

  return slots.flatMap((slot) => {
    if (slot.days.length > 0) return [{ days: formatDays(slot.days), hours: formatHours(slot.opensAt, slot.closesAt) }]
    return slot.legacy ? [slot.legacy] : []
  })
}
