import { Link } from 'react-router-dom'
import { FaClock, FaEye, FaTriangleExclamation } from 'react-icons/fa6'
import CampaignCover from '../../doacoes/components/CampaignCover'
import DonationProgress from '../../doacoes/components/DonationProgress'
import { getCategoriaMeta } from '../../doacoes/components/filters/filterOptions'
import { formatDonationsCount, getDeadlineSummary } from '../../doacoes/utils/campaignDisplay'
import { CAMPAIGN_STATUS_META, campaignStatus } from '../utils/listStatus'

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50'

// Uma campanha na lista do admin: de qual ONG, quanto já arrecadou e até quando.
// Excluída não tem mais página pública, então fica sem link
function AdminCampaignRow({ campaign }) {
  const status = CAMPAIGN_STATUS_META[campaignStatus(campaign)]
  const category = getCategoriaMeta(campaign.category)
  const deadline = getDeadlineSummary(campaign)

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="h-16 w-20 shrink-0 overflow-hidden rounded-xl">
          <CampaignCover campaign={campaign} className={campaign.isClosed || campaign.isRemoved ? 'grayscale-[40%]' : ''} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {campaign.isUrgent && !campaign.isClosed && !campaign.isRemoved && (
              <FaTriangleExclamation size={11} className="shrink-0 text-rose-600" title="Urgente" />
            )}
            <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{campaign.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {category.label} ·{' '}
            <Link to={`/ong/${campaign.ong.id}`} className="font-bold text-emerald-800 hover:underline">
              {campaign.ong.name}
            </Link>
          </p>
          <div className="mt-2 max-w-sm">
            <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} size="sm" />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span>{formatDonationsCount(campaign.donationsCount)}</span>
            {!campaign.isRemoved && (
              <span className="flex items-center gap-1">
                <FaClock size={9} />
                {deadline.label}
              </span>
            )}
          </p>
        </div>
      </div>

      {!campaign.isRemoved && (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to={`/campanhas/${campaign.id}`} className={ACTION_CLASSES}>
            <FaEye size={11} />
            Ver campanha
          </Link>
        </div>
      )}
    </li>
  )
}

export default AdminCampaignRow
