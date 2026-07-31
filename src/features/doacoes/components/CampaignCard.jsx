import { FaShieldHalved, FaTriangleExclamation, FaHandHoldingHeart } from 'react-icons/fa6'
import DonationProgress from './DonationProgress'
import { CATEGORIA_META } from './filters/filterOptions'

function CampaignCard({ campaign, onDonate }) {
  const { title, coverUrl, ong, category, raisedAmount, goalAmount, isUrgent } = campaign
  const categoria = CATEGORIA_META[category]
  const CategoriaIcon = categoria.icon

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-400 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-950/20">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
        />

        {isUrgent && (
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
          <h3 className="font-serif text-lg font-bold text-emerald-950">{title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <FaShieldHalved size={12} className="text-amber-500" />
            {ong.name}
          </p>
        </div>

        <DonationProgress raised={raisedAmount} goal={goalAmount} />

        <button
          type="button"
          onClick={() => onDonate(campaign)}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          <FaHandHoldingHeart size={14} />
          Fazer doação
        </button>
      </div>
    </div>
  )
}

export default CampaignCard