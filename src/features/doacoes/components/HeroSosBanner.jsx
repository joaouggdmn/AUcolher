import { Link } from 'react-router-dom'
import { FaTriangleExclamation, FaHandHoldingHeart, FaArrowRight } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import DonationProgress from './DonationProgress'
import { isCampaignOwner } from '../utils/campaignDisplay'

// Destaque da campanha urgente ativa mais recente (pickSosCampaign)
function HeroSosBanner({ campaign, onDonate }) {
  const { user } = useAuth()
  if (!campaign) return null

  const isOwner = isCampaignOwner(campaign, user)

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-emerald-950">
      {campaign.coverUrl && (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url("${campaign.coverUrl}")` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950 via-emerald-950/95 to-emerald-950/60" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-6 p-8 sm:p-10 lg:max-w-2xl lg:p-14">
        <span className="inline-flex w-fit animate-pulse items-center gap-2 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-extrabold text-white">
          <FaTriangleExclamation size={13} />
          CAMPANHA SOS · URGENTE
        </span>

        <h2 className="text-2xl font-black tracking-tight leading-tight text-white sm:text-3xl lg:text-4xl">
          {campaign.title}
        </h2>

        <p className="line-clamp-3 text-emerald-100/80">{campaign.description}</p>

        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} size="lg" theme="dark" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isOwner && (
            <button
              type="button"
              onClick={() => onDonate(campaign)}
              className="group flex w-fit items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 font-bold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
            >
              <FaHandHoldingHeart size={16} />
              Ajudar agora
            </button>
          )}
          <Link
            to={`/campanhas/${campaign.id}`}
            className="group flex w-fit items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition-all duration-300 hover:bg-white/10"
          >
            {isOwner ? 'Gerenciar campanha' : 'Ver detalhes'}
            <FaArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSosBanner
