import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHandHoldingDollar } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { formatCurrency } from '../../../../core/utils/currency'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../../core/components/ui/ShowMoreButton'
import { toLocalIsoDate } from '../../../../core/utils/localDate'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import ChartCard from './charts/ChartCard'
import ColumnChart from './charts/ColumnChart'

const PAGE_SIZE = 20
const CHART_MONTHS = 6

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Mês atual e os anteriores, zerados, somando cada doação no mês em que o PIX
// foi aprovado ('2026-10-10T12:00:00' → '2026-10')
function monthlyColumns(donations) {
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

function formatDateTime(isoDateTime) {
  return new Date(isoDateTime).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DonorAvatar({ donor }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
      {donor.photoUrl ? (
        <img src={donor.photoUrl} alt={donor.name} className="h-full w-full object-cover" />
      ) : (
        donor.name.charAt(0).toUpperCase()
      )}
    </span>
  )
}

// Aba "Doações recebidas": só as aprovadas, da mais recente para a mais
// antiga, inclusive de campanhas já removidas (o dinheiro entrou)
function OngDonationsPanel({ donations, isLoading, error, onRetry }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (isLoading) return <Spinner />
  if (error) {
    return <LoadErrorState title="Não foi possível carregar as doações" message={getErrorMessage(error)} onRetry={onRetry} />
  }

  if (donations.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaHandHoldingDollar}
        title="Nenhuma doação recebida ainda."
        description="Cada PIX confirmado nas campanhas da sua ONG aparece aqui, com quem doou e para qual campanha."
        action={{ to: '/campanhas/criar', label: 'Criar campanha', icon: FaHandHoldingDollar }}
      />
    )
  }

  const visible = donations.slice(0, visibleCount)

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-5">
        <ChartCard title="Recebido por mês" subtitle={`Últimos ${CHART_MONTHS} meses, em reais`}>
          <ColumnChart columns={monthlyColumns(donations)} colorClass="bg-amber-600" />
        </ChartCard>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {visible.map((donation) => (
          <li key={donation.id} className="flex items-center gap-3 px-4 py-3">
            <DonorAvatar donor={donation.donor} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-emerald-950">{donation.donor.name}</p>
              <p className="truncate text-xs text-slate-500">
                {donation.campaign.isRemoved ? (
                  <>
                    {donation.campaign.title} <span className="text-slate-400">(removida)</span>
                  </>
                ) : (
                  <Link to={`/campanhas/${donation.campaign.id}`} className="hover:text-emerald-700 hover:underline">
                    {donation.campaign.title}
                  </Link>
                )}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-black text-amber-600">{formatCurrency(donation.amount)}</p>
              <p className="text-[11px] text-slate-400">{formatDateTime(donation.approvedAt)}</p>
            </div>
          </li>
        ))}
      </ul>

      {visibleCount < donations.length && (
        <ShowMoreButton
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          remainingCount={donations.length - visibleCount}
        />
      )}
    </div>
  )
}

export default OngDonationsPanel
