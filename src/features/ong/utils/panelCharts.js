import { formatCurrency } from '../../../core/utils/currency'
import { toLocalIsoDate } from '../../../core/utils/localDate'
import { LISTING_STATUS_META } from '../../animais/utils/listingStatus'

// Dados prontos para os gráficos do painel (charts/*). As cores foram
// conferidas para daltonismo e contraste: categorias com esmeralda, âmbar e
// céu; "fora do ar" em cinza de propósito (é o que não pede atenção); funil
// num tom só que escurece a cada etapa

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'ADOPTED', 'INACTIVE']

const STATUS_COLORS = {
  AVAILABLE: 'bg-emerald-700',
  IN_PROGRESS: 'bg-amber-600',
  ADOPTED: 'bg-sky-600',
  INACTIVE: 'bg-slate-300',
}

const SPECIES = [
  { key: 'DOG', label: 'Cães' },
  { key: 'CAT', label: 'Gatos' },
  { key: 'OTHER', label: 'Outros' },
]

// Cada etapa conta quem chegou nela ou passou dela
const FUNNEL_STAGES = [
  { key: 'received', label: 'Pedidos recebidos', statuses: null, colorClass: 'bg-emerald-500' },
  { key: 'accepted', label: 'Aceitos', statuses: ['ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED'], colorClass: 'bg-emerald-600' },
  { key: 'delivery', label: 'Entrega confirmada', statuses: ['AWAITING_DELIVERY', 'CONCLUDED'], colorClass: 'bg-emerald-700' },
  { key: 'concluded', label: 'Adoções concluídas', statuses: ['CONCLUDED'], colorClass: 'bg-emerald-800' },
]

export const CHART_MONTHS = 6

export function countAnimalsByStatus(animals) {
  return Object.fromEntries(
    STATUS_ORDER.map((status) => [status, animals.filter((animal) => animal.listingStatus === status).length])
  )
}

export function animalStatusSegments(animals) {
  const counts = countAnimalsByStatus(animals)
  return STATUS_ORDER.map((status) => ({
    key: status,
    label: LISTING_STATUS_META[status].label,
    value: counts[status],
    colorClass: STATUS_COLORS[status],
  }))
}

// "Outros" só aparece se houver algum
export function speciesBars(animals) {
  return SPECIES.map(({ key, label }) => ({
    key,
    label,
    value: animals.filter((animal) => animal.species === key).length,
    colorClass: 'bg-emerald-600',
  })).filter((bar) => bar.key !== 'OTHER' || bar.value > 0)
}

export function adoptionFunnel(requests) {
  return FUNNEL_STAGES.map(({ statuses, ...stage }) => {
    const value = statuses ? requests.filter((request) => statuses.includes(request.status)).length : requests.length
    const share = requests.length > 0 ? Math.round((value / requests.length) * 100) : 0
    return { ...stage, value, note: `${share}%` }
  })
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Mês atual e os anteriores, do mais antigo para o atual ('2026-10')
function lastMonths(months) {
  const today = new Date()
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1)
    return { key: toLocalIsoDate(date).slice(0, 7), date }
  })
}

// Soma cada item no mês da data dele ('2026-10-10T12:00:00' → '2026-10').
// Devolve o mesmo formato de uma série mensal da API: [{ month, value, count }]
export function bucketByMonth(items, { dateOf, valueOf = () => 1 }) {
  const byMonth = new Map()
  for (const item of items) {
    const month = dateOf(item)?.slice(0, 7)
    if (!month) continue
    const bucket = byMonth.get(month) ?? { month, value: 0, count: 0 }
    bucket.value += valueOf(item)
    bucket.count += 1
    byMonth.set(month, bucket)
  }
  return [...byMonth.values()]
}

// Série mensal → colunas do ColumnChart: os últimos `months` meses, zerados
// onde não há dado. `formatValue` escreve o valor por extenso (dica e leitor
// de tela); `countLabel` ([singular, plural]) acrescenta a contagem ao detalhe
export function monthColumns(points, { months = CHART_MONTHS, formatValue = String, countLabel } = {}) {
  const byMonth = new Map(points.map((point) => [point.month, point]))

  return lastMonths(months).map(({ key, date }) => {
    const value = byMonth.get(key)?.value ?? 0
    const count = byMonth.get(key)?.count ?? 0
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return {
      key,
      value,
      label: capitalize(date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')),
      valueLabel: value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }),
      valueText: formatValue(value),
      detail: countLabel ? `${monthName} · ${count} ${count === 1 ? countLabel[0] : countLabel[1]}` : monthName,
    }
  })
}

// Recebido por mês: cada doação conta no mês em que o PIX foi aprovado
export function monthlyDonationColumns(donations) {
  const points = bucketByMonth(donations, {
    dateOf: (donation) => donation.approvedAt,
    valueOf: (donation) => donation.amount,
  })
  return monthColumns(points, { formatValue: formatCurrency, countLabel: ['doação', 'doações'] })
}
