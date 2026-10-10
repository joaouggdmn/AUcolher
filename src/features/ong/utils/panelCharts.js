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

// Mês atual e os anteriores, zerados, somando cada doação no mês em que o PIX
// foi aprovado ('2026-10-10T12:00:00' → '2026-10')
export function monthlyDonationColumns(donations) {
  const today = new Date()
  const months = Array.from({ length: CHART_MONTHS }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (CHART_MONTHS - 1 - index), 1)
    return { key: toLocalIsoDate(date).slice(0, 7), date, value: 0, count: 0 }
  })
  const byKey = new Map(months.map((month) => [month.key, month]))

  for (const donation of donations) {
    const month = byKey.get(donation.approvedAt?.slice(0, 7))
    if (month) {
      month.value += donation.amount
      month.count += 1
    }
  }

  return months.map(({ key, date, value, count }) => ({
    key,
    value,
    label: capitalize(date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')),
    valueLabel: value.toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }),
    valueText: formatCurrency(value),
    detail: `${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · ${count} ${count === 1 ? 'doação' : 'doações'}`,
  }))
}
