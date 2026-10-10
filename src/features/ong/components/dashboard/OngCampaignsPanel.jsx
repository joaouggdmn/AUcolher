import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaClock, FaHandHoldingHeart, FaLock, FaPen, FaTrashCan, FaTriangleExclamation } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import CampaignCover from '../../../doacoes/components/CampaignCover'
import CloseCampaignDialog from '../../../doacoes/components/CloseCampaignDialog'
import DeleteCampaignDialog from '../../../doacoes/components/DeleteCampaignDialog'
import DonationProgress from '../../../doacoes/components/DonationProgress'
import { formatDonationsCount, getDeadlineSummary } from '../../../doacoes/utils/campaignDisplay'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300'

// Encerrada fica só como histórico: dá para excluir, mas não editar nem
// encerrar de novo (o backend recusaria)
function OngCampaignRow({ campaign, onCloseCampaign, onDelete }) {
  const deadline = getDeadlineSummary(campaign)

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link to={`/campanhas/${campaign.id}`} className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
          <CampaignCover campaign={campaign} className={campaign.isClosed ? 'grayscale-[40%]' : ''} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {campaign.isUrgent && !campaign.isClosed && (
              <FaTriangleExclamation size={11} className="shrink-0 text-rose-600" title="Urgente" />
            )}
            <Link
              to={`/campanhas/${campaign.id}`}
              className="block truncate text-base font-extrabold tracking-tight text-emerald-950 transition-colors duration-300 hover:text-emerald-700"
            >
              {campaign.title}
            </Link>
          </div>
          <div className="mt-2 max-w-sm">
            <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} size="sm" />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span>{formatDonationsCount(campaign.donationsCount)}</span>
            <span className="flex items-center gap-1">
              <FaClock size={9} />
              {deadline.label}
            </span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {!campaign.isClosed && (
          <>
            <Link
              to={`/campanhas/editar/${campaign.id}`}
              className={`${ACTION_CLASSES} border-slate-200 text-slate-600 hover:bg-slate-50`}
            >
              <FaPen size={10} />
              Editar
            </Link>
            <button
              type="button"
              onClick={() => onCloseCampaign(campaign)}
              className={`${ACTION_CLASSES} border-amber-200 text-amber-700 hover:bg-amber-50`}
            >
              <FaLock size={10} />
              Encerrar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onDelete(campaign)}
          className={`${ACTION_CLASSES} border-rose-200 text-rose-600 hover:bg-rose-50`}
        >
          <FaTrashCan size={10} />
          Excluir
        </button>
      </div>
    </li>
  )
}

function CampaignGroup({ title, campaigns, ...rowProps }) {
  if (campaigns.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
        {title} <span className="text-slate-400">({campaigns.length})</span>
      </h3>
      <ul className="flex flex-col gap-3">
        {campaigns.map((campaign) => (
          <OngCampaignRow key={campaign.id} campaign={campaign} {...rowProps} />
        ))}
      </ul>
    </div>
  )
}

// Aba "Campanhas" do painel. `campaigns` já vem dividido em ativas e encerradas
function OngCampaignsPanel({ campaigns, isLoading, error, onRetry, onNotify }) {
  const [campaignToClose, setCampaignToClose] = useState(null)
  const [campaignToDelete, setCampaignToDelete] = useState(null)

  if (isLoading) return <Spinner />
  if (error) {
    return <LoadErrorState title="Não foi possível carregar suas campanhas" message={getErrorMessage(error)} onRetry={onRetry} />
  }

  if (campaigns.active.length === 0 && campaigns.closed.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaHandHoldingHeart}
        title="Sua ONG ainda não abriu nenhuma campanha."
        description="Campanhas de doação aparecem na vitrine, na página inicial e no perfil da ONG, e recebem por PIX."
        action={{ to: '/campanhas/criar', label: 'Criar primeira campanha', icon: FaHandHoldingHeart }}
      />
    )
  }

  const rowProps = { onCloseCampaign: setCampaignToClose, onDelete: setCampaignToDelete }

  return (
    <div className="flex flex-col gap-8">
      <CampaignGroup title="Recebendo doações" campaigns={campaigns.active} {...rowProps} />
      <CampaignGroup title="Encerradas" campaigns={campaigns.closed} {...rowProps} />

      {campaignToClose && (
        <CloseCampaignDialog
          campaign={campaignToClose}
          onClose={() => setCampaignToClose(null)}
          onClosed={(message) => {
            setCampaignToClose(null)
            onNotify(message)
          }}
        />
      )}

      {campaignToDelete && (
        <DeleteCampaignDialog
          campaign={campaignToDelete}
          onClose={() => setCampaignToDelete(null)}
          onDeleted={(message) => {
            setCampaignToDelete(null)
            onNotify(message)
          }}
        />
      )}
    </div>
  )
}

export default OngCampaignsPanel
