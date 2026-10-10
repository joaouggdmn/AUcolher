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
import { formatDonationsCount, getDeadlineSummary, isCampaignOwner } from '../utils/campaignDisplay'

const DEADLINE_TONES = {
  neutral: 'text-slate-500',
  soon: 'text-amber-600',
  closed: 'text-slate-400',
}

// Botão do rodapé: doar (padrão), gerenciar (a própria ONG) ou só ver (encerrada)
function CardAction({ campaign, isOwner, onDonate }) {
  const linkClass =
    'mt-auto flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold transition-all duration-300'

  if (isOwner) {
    return (
      <Link to={`/campanhas/${campaign.id}`} className={`${linkClass} border-emerald-200 text-emerald-800 hover:bg-emerald-50`}>
        <FaGear size={13} />
        Gerenciar campanha
      </Link>
    )
  }

  if (campaign.isClosed) {
    return (
      <Link to={`/campanhas/${campaign.id}`} className={`${linkClass} border-slate-200 text-slate-500 hover:bg-slate-50`}>
        Ver campanha
        <FaArrowRight size={11} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onDonate(campaign)}
      className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
    >
      <FaHandHoldingHeart size={14} />
      Fazer doação
    </button>
  )
}

function CampaignCard({ campaign, onDonate }) {
  const { user } = useAuth()
  const categoria = getCategoriaMeta(campaign.category)
  const CategoriaIcon = categoria.icon
  const deadline = getDeadlineSummary(campaign)
  const isOwner = isCampaignOwner(campaign, user)

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-2xl hover:shadow-emerald-950/20 ${
        campaign.isClosed ? 'shadow-slate-500/10 ring-1 ring-slate-200' : 'shadow-amber-500/10 ring-2 ring-amber-400'
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Link to={`/campanhas/${campaign.id}`} className="block h-full">
          <CampaignCover
            campaign={campaign}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 ${
              campaign.isClosed ? 'grayscale-[40%]' : ''
            }`}
          />
        </Link>

        {campaign.isUrgent && !campaign.isClosed && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-md">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <FaCircleCheck size={10} />
                  Meta atingida!
                </span>
              )}
              {campaign.isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  <FaLock size={9} />
                  Encerrada
                </span>
              )}
            </div>
          )}

          <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">
            <Link to={`/campanhas/${campaign.id}`} className="transition-colors duration-300 hover:text-emerald-700">
              {campaign.title}
            </Link>
          </h3>
          <Link
            to={`/ong/${campaign.ong.id}`}
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-300 hover:text-emerald-700"
          >
            {campaign.ong.isVerified && (
              <FaShieldHalved size={12} className="shrink-0 text-amber-500" title="Instituição verificada" />
            )}
            {campaign.ong.name}
          </Link>
        </div>

        <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="whitespace-nowrap text-slate-500">{formatDonationsCount(campaign.donationsCount)}</span>
          <span className={`flex items-center gap-1 whitespace-nowrap ${DEADLINE_TONES[deadline.tone]}`}>
            <FaClock size={10} />
            {deadline.label}
          </span>
        </div>

        <CardAction campaign={campaign} isOwner={isOwner} onDonate={onDonate} />
      </div>
    </div>
  )
}

export default CampaignCard
