// Datas "locais" no formato do LocalDate/LocalDateTime do Spring (sem fuso).
// Nunca usar toISOString() para "hoje": ela converte para UTC, e depois das
// 21h no Brasil já seria o dia seguinte
function pad(value) {
  return String(value).padStart(2, '0')
}

export function toLocalIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayLocalIso() {
  return toLocalIsoDate(new Date())
}

export function toLocalIsoDateTime(date) {
  return `${toLocalIsoDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function nowLocalIso() {
  return toLocalIsoDateTime(new Date())
}

// "2026-09-27T14:00:00" + 30 → "2026-09-27T14:30:00" (sem fuso, como o Spring)
export function addMinutesLocalIso(isoDateTime, minutes) {
  const date = new Date(isoDateTime)
  date.setMinutes(date.getMinutes() + minutes)
  return toLocalIsoDateTime(date)
}

// "2026-09-27" + 3 → "2026-09-30"
export function addDaysIso(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toLocalIsoDate(date)
}
