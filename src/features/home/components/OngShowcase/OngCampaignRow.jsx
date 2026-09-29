import { FaHeart } from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'

function OngCampaignRow({ campaign, onDonate }) {
  const { title, raisedAmount, goalAmount, isUrgent } = campaign
  const percent = goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0

  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-emerald-950">{title}</p>
          {isUrgent && (
            <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">Urgente</span>
          )}
        </div>

        <div
          role="progressbar"
          aria-label={`Arrecadado para ${title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100"
        >
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
        </div>

        <p className="mt-1.5 text-xs text-slate-500">
          <strong className="font-bold tabular-nums text-emerald-950">{formatCurrency(raisedAmount)}</strong> de{' '}
          <span className="tabular-nums">{formatCurrency(goalAmount)}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDonate(campaign)}
        aria-label={`Doar para ${title}`}
        className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
      >
        <FaHeart aria-hidden="true" size={12} className="text-rose-300" />
        Doar
      </button>
    </li>
  )
}

export default OngCampaignRow
