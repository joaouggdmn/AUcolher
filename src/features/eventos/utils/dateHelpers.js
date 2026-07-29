const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export function getDateParts(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  return {
    day: date.getDate(),
    monthLabel: MONTH_ABBR[date.getMonth()],
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
  }
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Calcula o período em relação a "hoje" real (new Date()) — funciona com qualquer data mockada
export function matchesPeriod(dateStr, period) {
  const eventDate = startOfDay(new Date(`${dateStr}T00:00:00`))
  const today = startOfDay(new Date())
  const diffDays = Math.round((eventDate - today) / 86400000)

  if (diffDays < 0) return false // eventos que já passaram nunca aparecem na listagem

  if (!period) return true
  if (period === 'HOJE') return diffDays === 0

  if (period === 'FIM_DE_SEMANA') {
    const dayOfWeek = today.getDay() // 0 = domingo ... 6 = sábado
    const daysToSaturday = (6 - dayOfWeek + 7) % 7
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + daysToSaturday)
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    return eventDate.getTime() === saturday.getTime() || eventDate.getTime() === sunday.getTime()
  }

  if (period === 'PROXIMOS_30_DIAS') return diffDays <= 30

  return true
}