import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCircleCheck,
  FaClock,
  FaHandHoldingHeart,
  FaLocationDot,
  FaLock,
  FaPen,
  FaTrashCan,
  FaTriangleExclamation,
  FaUserGroup,
} from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import Spinner from '../../../core/components/ui/Spinner'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import VerifiedBadge from '../../ong/components/VerifiedBadge'
import CampaignCover from '../components/CampaignCover'
import CampaignUnavailableState from '../components/CampaignUnavailableState'
import CloseCampaignDialog from '../components/CloseCampaignDialog'
import DeleteCampaignDialog from '../components/DeleteCampaignDialog'
import DonationModal from '../components/DonationModal'
import DonationProgress from '../components/DonationProgress'
import { getCategoriaMeta } from '../components/filters/filterOptions'
import { useCampaign } from '../hooks/useCampanhas'
import { formatDonationsCount, getDeadlineSummary, isCampaignOwner } from '../utils/campaignDisplay'

const DEADLINE_TONES = {
  neutral: 'text-slate-600',
  soon: 'text-amber-600',
  closed: 'text-slate-500',
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={14} />
      </span>
      <div className="min-w-0 pt-1.5 text-sm text-slate-600">{children}</div>
    </div>
  )
}

function OngCard({ ong }) {
  const place = [ong.city, ong.state].filter(Boolean).join(' - ')

  return (
    <Link
      to={`/ong/${ong.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-emerald-950/5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-700 text-sm font-black text-white">
        {ong.photoUrl ? (
          <img src={ong.photoUrl} alt={ong.name} className="h-full w-full object-cover" />
        ) : (
          ong.name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Campanha de</p>
        <p className="truncate text-sm font-bold text-emerald-950">{ong.name}</p>
        {place && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <FaLocationDot size={10} />
            {place}
          </p>
        )}
        {ong.isVerified && (
          <div className="mt-1">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-700">
        Ver perfil
        <FaArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

// Ações da ONG dona: editar e encerrar enquanto está aberta; excluir sempre
function OwnerActions({ campaign, onCloseCampaign, onDelete }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
        Esta campanha é da sua ONG. As doações entram no total assim que o PIX é confirmado.
      </p>
      {!campaign.isClosed && (
        <Link
          to={`/campanhas/editar/${campaign.id}`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 py-3 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50"
        >
          <FaPen size={12} />
          Editar campanha
        </Link>
      )}
      <div className={`grid gap-2 ${campaign.isClosed ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {!campaign.isClosed && (
          <button
            type="button"
            onClick={onCloseCampaign}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 py-3 text-sm font-bold text-amber-700 transition-all duration-300 hover:bg-amber-50"
          >
            <FaLock size={11} />
            Encerrar
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 py-3 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50"
        >
          <FaTrashCan size={11} />
          Excluir
        </button>
      </div>
    </div>
  )
}

// Ação principal do painel lateral: doar, aviso de encerrada ou ações da dona
function MainAction({ campaign, isOwner, onDonate, ownerActions }) {
  if (isOwner) return <OwnerActions campaign={campaign} {...ownerActions} />

  if (campaign.isClosed) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
        <FaLock size={12} />
        Campanha encerrada: não recebe mais doações.
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={onDonate}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900"
    >
      <FaHandHoldingHeart size={15} />
      Fazer doação
    </button>
  )
}

function CampaignDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: campaign, isLoading, isError, error, refetch } = useCampaign(id)
  const [isDonationOpen, setIsDonationOpen] = useState(false)
  const [ownerDialog, setOwnerDialog] = useState(null) // 'close' | 'delete' | null
  // "Campanha publicada!" / "Campanha atualizada!" vindo do formulário
  const [flashMessage, setFlashMessage] = useState(location.state?.flash ?? null)
  const clearFlashMessage = useCallback(() => setFlashMessage(null), [])

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    // 404 = não existe ou foi excluída
    if (error?.response?.status === 404) return <CampaignUnavailableState />

    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32">
        <LoadErrorState
          title="Não foi possível carregar a campanha"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const categoria = getCategoriaMeta(campaign.category)
  const CategoriaIcon = categoria.icon
  const deadline = getDeadlineSummary(campaign)
  const isOwner = isCampaignOwner(campaign, user)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Link
        to="/campanhas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition-colors duration-300 hover:text-emerald-600"
      >
        <FaArrowLeft size={12} />
        Todas as campanhas
      </Link>

      <div className="relative h-56 overflow-hidden rounded-3xl shadow-lg shadow-emerald-950/10 sm:h-80">
        <CampaignCover campaign={campaign} className={campaign.isClosed ? 'grayscale-[40%]' : ''} />
        {campaign.isUrgent && !campaign.isClosed && (
          <span className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md">
            <FaTriangleExclamation size={12} />
            Urgente
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${categoria.className}`}>
                <CategoriaIcon size={12} />
                {categoria.label}
              </span>
              {campaign.isGoalReached && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <FaCircleCheck size={11} />
                  Meta atingida!
                </span>
              )}
              {campaign.isClosed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  <FaLock size={10} />
                  Encerrada
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">{campaign.title}</h1>
          </header>

          <section>
            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">Sobre a campanha</h2>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed text-slate-600">{campaign.description}</p>
          </section>

          {campaign.isGoalReached && !campaign.isClosed && (
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-sm text-emerald-900">
              A meta foi batida, mas a campanha continua aberta: o que passar dela também ajuda a ONG.
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-emerald-950/5">
            <div>
              <p className="text-3xl font-black tracking-tight text-emerald-950">{formatCurrency(campaign.raisedAmount)}</p>
              <p className="text-sm text-slate-500">arrecadados de {formatCurrency(campaign.goalAmount)}</p>
            </div>

            <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} size="lg" showAmounts={false} />

            <InfoRow icon={FaUserGroup}>
              <span className="font-semibold text-emerald-950">{formatDonationsCount(campaign.donationsCount)}</span>
            </InfoRow>
            <InfoRow icon={FaClock}>
              <span className={`font-semibold ${DEADLINE_TONES[deadline.tone]}`}>{deadline.label}</span>
            </InfoRow>

            <MainAction
              campaign={campaign}
              isOwner={isOwner}
              onDonate={() => setIsDonationOpen(true)}
              ownerActions={{ onCloseCampaign: () => setOwnerDialog('close'), onDelete: () => setOwnerDialog('delete') }}
            />
          </div>

          <OngCard ong={campaign.ong} />
        </aside>
      </div>

      {isDonationOpen && <DonationModal campaign={campaign} onClose={() => setIsDonationOpen(false)} />}

      {ownerDialog === 'close' && (
        <CloseCampaignDialog
          campaign={campaign}
          onClose={() => setOwnerDialog(null)}
          onClosed={(message) => {
            setOwnerDialog(null)
            setFlashMessage(message)
          }}
        />
      )}

      {ownerDialog === 'delete' && (
        <DeleteCampaignDialog
          campaign={campaign}
          onClose={() => setOwnerDialog(null)}
          // A página da campanha deixa de existir: volta para o painel com o aviso
          onDeleted={(message) => navigate('/ong/dashboard', { state: { flash: message } })}
        />
      )}

      <SuccessToast message={flashMessage} onClose={clearFlashMessage} />
    </div>
  )
}

export default CampaignDetailPage
