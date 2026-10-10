import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaHandHoldingDollar } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { formatCurrency } from '../../../../core/utils/currency'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../../core/components/ui/ShowMoreButton'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'

const PAGE_SIZE = 20

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
