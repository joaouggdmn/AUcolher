import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaCircleCheck,
  FaClock,
  FaGear,
  FaHandHoldingHeart,
  FaLock,
  FaShieldHalved,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import CampaignCover from './CampaignCover'
import DonationProgress from './DonationProgress'
import { getCategoriaMeta } from './filters/filterOptions'
import { formatDonationsCount, getDeadlineSummary, isAdminAccount, isCampaignOwner } from '../utils/campaignDisplay'

const DEADLINE_TONES = {
  neutral: 'text-ink-500',
  soon: 'text-accent-600',
  closed: 'text-ink-500',
}

// Botão do rodapé: doar (padrão), gerenciar (a própria ONG) ou só ver (encerrada)
function CardAction({ campaign, isOwner, isAdmin, onDonate }) {
  const linkClass =
    'mt-auto flex items-center justify-center gap-2 rounded-control border py-2.5 text-sm font-bold transition-all duration-300'

  if (isOwner) {
    return (
      <Link to={`/campanhas/${campaign.id}`} className={`${linkClass} border-brand-200 text-brand-700 hover:bg-brand-50`}>
        <FaGear size={13} />
        Gerenciar campanha
      </Link>
    )
  }

  // Encerrada, ou o admin (que modera, mas não doa): só abre a campanha
  if (campaign.isClosed || isAdmin) {
    return (
      <Link to={`/campanhas/${campaign.id}`} className={`${linkClass} border-line text-ink-500 hover:bg-paper`}>
        Ver campanha
        <FaArrowRight size={11} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onDonate(campaign)}
      className="mt-auto flex items-center justify-center gap-2 rounded-control bg-brand-700 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
    >
      <FaHandHoldingHeart size={14} />
      Fazer doação
    </button>
  )
}

function CampaignCard({ campaign, onDonate }) {
  const { user } = useAuth()
  const categoria = getCategoriaMeta(campaign.category, campaign.customCategory)
  const CategoriaIcon = categoria.icon
  const deadline = getDeadlineSummary(campaign)
  const isOwner = isCampaignOwner(campaign, user)

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-modal bg-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-2xl hover: ${
        campaign.isClosed ? ' ring-1 ring-line' : ' ring-2 ring-accent-400'
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Link to={`/campanhas/${campaign.id}`} className="block h-full">
          <CampaignCover
            campaign={campaign}
            className={campaign.isClosed ? 'grayscale-[40%]' : ''}
          />
        </Link>

        {campaign.isUrgent && !campaign.isClosed && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-danger-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-md">
            <FaTriangleExclamation size={11} />
            Urgente
          </span>
        )}

        <span className={`absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${categoria.className}`}>
          <CategoriaIcon size={11} />
          {categoria.label}
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          {(campaign.isGoalReached || campaign.isClosed) && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {campaign.isGoalReached && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
                  <FaCircleCheck size={10} />
                  Meta atingida!
                </span>
              )}
              {campaign.isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold text-ink-500">
                  <FaLock size={9} />
                  Encerrada
                </span>
              )}
            </div>
          )}

          <h3 className="text-lg font-extrabold tracking-tight text-brand-950">
            <Link to={`/campanhas/${campaign.id}`} className="transition-colors duration-300 hover:text-brand-600">
              {campaign.title}
            </Link>
          </h3>
          <Link
            to={`/ong/${campaign.ong.id}`}
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors duration-300 hover:text-brand-600"
          >
            {campaign.ong.isVerified && (
              <FaShieldHalved size={12} className="shrink-0 text-accent-500" title="Instituição verificada" />
            )}
            {campaign.ong.name}
          </Link>
        </div>

        <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="whitespace-nowrap text-ink-500">{formatDonationsCount(campaign.donationsCount, { invite: !isOwner && !isAdminAccount(user) })}</span>
          <span className={`flex items-center gap-1 whitespace-nowrap ${DEADLINE_TONES[deadline.tone]}`}>
            <FaClock size={10} />
            {deadline.label}
          </span>
        </div>

        <CardAction campaign={campaign} isOwner={isOwner} isAdmin={isAdminAccount(user)} onDonate={onDonate} />
      </div>
    </div>
  )
}

export default CampaignCard
