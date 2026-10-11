import { formatCurrency } from '../../../core/utils/currency'
import { toLocalIsoDate } from '../../../core/utils/localDate'
import { LISTING_STATUS_META } from '../../animais/utils/listingStatus'

// Dados prontos para os gráficos do painel (charts/*). As cores foram
// conferidas para daltonismo e contraste: categorias com esmeralda, âmbar e
// céu; "fora do ar" em cinza de propósito (é o que não pede atenção); funil
// num tom só que escurece a cada etapa

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'ADOPTED', 'INACTIVE', 'REMOVED']

// Removido pela moderação também é "fora do site", mas pede atenção: rosa
// claro, separado do cinza por luminosidade e não só pela cor
const STATUS_COLORS = {
  AVAILABLE: 'bg-emerald-700',
  IN_PROGRESS: 'bg-amber-600',
  ADOPTED: 'bg-sky-600',
  INACTIVE: 'bg-slate-300',
  REMOVED: 'bg-rose-400',
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

// Os gráficos também aceitam contagens prontas ({ AVAILABLE: 3, ... }), que
// é o que o painel do admin recebe da API. Só entram as situações presentes
export function animalStatusSegmentsFromCounts(counts) {
  return STATUS_ORDER.filter((status) => status in counts).map((status) => ({
    key: status,
    label: LISTING_STATUS_META[status].label,
    value: counts[status],
    colorClass: STATUS_COLORS[status],
  }))
}

export function animalStatusSegments(animals) {
  return animalStatusSegmentsFromCounts(countAnimalsByStatus(animals))
}

// "Outros" só aparece se houver algum
export function speciesBarsFromCounts(bySpecies) {
  return SPECIES.map(({ key, label }) => ({
    key,
    label,
    value: bySpecies[key] ?? 0,
    colorClass: 'bg-emerald-600',
  })).filter((bar) => bar.key !== 'OTHER' || bar.value > 0)
}

export function speciesBars(animals) {
  const bySpecies = Object.fromEntries(
    SPECIES.map(({ key }) => [key, animals.filter((animal) => animal.species === key).length])
  )
  return speciesBarsFromCounts(bySpecies)
}

// `funnel`: { received, accepted, delivery, concluded }, as chaves das etapas
export function adoptionFunnelFromCounts(funnel) {
  return FUNNEL_STAGES.map(({ key, label, colorClass }) => {
    const value = funnel[key] ?? 0
    const share = funnel.received > 0 ? Math.round((value / funnel.received) * 100) : 0
    return { key, label, colorClass, value, note: `${share}%` }
  })
}

export function adoptionFunnel(requests) {
  const funnel = Object.fromEntries(
    FUNNEL_STAGES.map(({ key, statuses }) => [
      key,
      statuses ? requests.filter((request) => statuses.includes(request.status)).length : requests.length,
    ])
  )
  return adoptionFunnelFromCounts(funnel)
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
