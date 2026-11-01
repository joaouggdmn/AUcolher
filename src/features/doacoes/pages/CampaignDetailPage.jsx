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
import ModeratedNote from '../../../core/components/ui/ModeratedNote'
import ModerationAction from '../../admin/components/ModerationAction'
import { ADMIN_PATHS } from '../../admin/panel/adminPaths'
import { useRemoveCampaign } from '../../admin/hooks/useAdmin'
import { removeCampaignDescription } from '../../admin/utils/moderationText'
import CampaignCover from '../components/CampaignCover'
import CampaignUnavailableState from '../components/CampaignUnavailableState'
import CloseCampaignDialog from '../components/CloseCampaignDialog'
import DeleteCampaignDialog from '../components/DeleteCampaignDialog'
import DonationModal from '../components/DonationModal'
import DonationProgress from '../components/DonationProgress'
import { getCategoriaMeta } from '../components/filters/filterOptions'
import { useCampaign } from '../hooks/useCampanhas'
import { formatDonationsCount, getDeadlineSummary, isAdminAccount, isCampaignOwner } from '../utils/campaignDisplay'
import { PANEL_PATHS } from '../../ong/panel/panelPaths'

const DEADLINE_TONES = {
  neutral: 'text-ink-600',
  soon: 'text-accent-600',
  closed: 'text-ink-500',
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
        <Icon size={14} />
      </span>
      <div className="min-w-0 pt-1.5 text-sm text-ink-600">{children}</div>
    </div>
  )
}

function OngCard({ ong }) {
  const place = [ong.city, ong.state].filter(Boolean).join(' - ')

  return (
    <Link
      to={`/ong/${ong.id}`}
      className="group flex items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-control bg-brand-600 text-sm font-black text-white">
        {ong.photoUrl ? (
          <img src={ong.photoUrl} alt={ong.name} className="h-full w-full object-cover" />
        ) : (
          ong.name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">Campanha de</p>
        <p className="truncate text-sm font-bold text-brand-950">{ong.name}</p>
        {place && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
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
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-brand-600">
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
      <p className="rounded-card bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-700">
        Esta campanha é da sua ONG. As doações entram no total assim que o PIX é confirmado.
      </p>
      {!campaign.isClosed && (
        <Link
          to={PANEL_PATHS.campaignEdit(campaign.id)}
          className="flex items-center justify-center gap-2 rounded-card border border-brand-200 py-3 text-sm font-bold text-brand-700 transition-all duration-300 hover:bg-brand-50"
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
            className="flex items-center justify-center gap-2 rounded-card border border-accent-200 py-3 text-sm font-bold text-accent-700 transition-all duration-300 hover:bg-accent-50"
          >
            <FaLock size={11} />
            Encerrar
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-2 rounded-card border border-danger-600/30 py-3 text-sm font-bold text-danger-600 transition-all duration-300 hover:bg-danger-50"
        >
          <FaTrashCan size={11} />
          Excluir
        </button>
      </div>
    </div>
  )
}

// Ação principal do painel lateral: doar, aviso de encerrada, ações da dona
// ou, para o admin (que modera, mas não doa), a remoção
function MainAction({ campaign, isOwner, onDonate, ownerActions, adminAction }) {
  if (isOwner) return <OwnerActions campaign={campaign} {...ownerActions} />
  if (adminAction) return adminAction

  if (campaign.isClosed) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-card bg-sand px-4 py-3 text-center text-sm font-semibold text-ink-500">
        <FaLock size={12} />
        Campanha encerrada: não recebe mais doações.
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={onDonate}
      className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-700 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-800"
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
  const removeCampaign = useRemoveCampaign()
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

  const categoria = getCategoriaMeta(campaign.category, campaign.customCategory)
  const CategoriaIcon = categoria.icon
  const deadline = getDeadlineSummary(campaign)
  const isOwner = isCampaignOwner(campaign, user)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Link
        to="/campanhas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition-colors duration-300 hover:text-brand-600"
      >
        <FaArrowLeft size={12} />
        Todas as campanhas
      </Link>

      {/* Só a ONG dona e o admin sabem que a moderação editou a campanha */}
      {(isOwner || isAdminAccount(user)) && (
        <ModeratedNote moderatedAt={campaign.moderatedAt} size="md" className="mb-6" />
      )}

      <div className="relative h-56 overflow-hidden rounded-card shadow-lg sm:h-80">
        <CampaignCover campaign={campaign} className={campaign.isClosed ? 'grayscale-[40%]' : ''} />
        {campaign.isUrgent && !campaign.isClosed && (
          <span className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-danger-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                  <FaCircleCheck size={11} />
                  Meta atingida!
                </span>
              )}
              {campaign.isClosed && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink-500">
                  <FaLock size={10} />
                  Encerrada
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-brand-950 sm:text-4xl">{campaign.title}</h1>
          </header>

          <section>
            <h2 className="text-lg font-extrabold tracking-tight text-brand-950">Sobre a campanha</h2>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed text-ink-600">{campaign.description}</p>
          </section>

          {campaign.isGoalReached && !campaign.isClosed && (
            <p className="rounded-card border border-brand-100 bg-brand-50/60 px-5 py-4 text-sm text-brand-800">
              A meta foi batida, mas a campanha continua aberta: o que passar dela também ajuda a ONG.
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 shadow-lg ">
            <div>
              <p className="text-3xl font-black tracking-tight text-brand-950">{formatCurrency(campaign.raisedAmount)}</p>
              <p className="text-sm text-ink-500">arrecadados de {formatCurrency(campaign.goalAmount)}</p>
            </div>

            <DonationProgress raised={campaign.raisedAmount} goal={campaign.goalAmount} size="lg" showAmounts={false} />

            <InfoRow icon={FaUserGroup}>
              <span className="font-semibold text-brand-950">{formatDonationsCount(campaign.donationsCount, { invite: !isOwner && !isAdminAccount(user) })}</span>
            </InfoRow>
            <InfoRow icon={FaClock}>
              <span className={`font-semibold ${DEADLINE_TONES[deadline.tone]}`}>{deadline.label}</span>
            </InfoRow>

            <MainAction
              campaign={campaign}
              isOwner={isOwner}
              onDonate={() => setIsDonationOpen(true)}
              ownerActions={{ onCloseCampaign: () => setOwnerDialog('close'), onDelete: () => setOwnerDialog('delete') }}
              adminAction={
                isAdminAccount(user) && (
                  <div className="flex flex-col gap-2">
                    {!campaign.isClosed && (
                      <Link
                        to={ADMIN_PATHS.campaignEdit(campaign.id)}
                        state={{ from: location.pathname }}
                        className="flex w-full items-center justify-center gap-2 rounded-card border border-brand-200 bg-white py-3.5 text-sm font-bold text-brand-700 transition-all duration-300 hover:bg-brand-50"
                      >
                        <FaPen size={12} />
                        Editar campanha
                      </Link>
                    )}
                    <ModerationAction
                      icon={FaTrashCan}
                      label="Remover campanha"
                      dialog={{
                        title: 'Remover a campanha?',
                        description: removeCampaignDescription(campaign.title),
                        confirmLabel: 'Remover campanha',
                        processingLabel: 'Removendo...',
                      }}
                      mutation={removeCampaign}
                      variables={{ id: campaign.id }}
                      onDone={() => navigate('/campanhas')}
                    />
                  </div>
                )
              }
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
          onDeleted={(message) => navigate(PANEL_PATHS.campaigns, { state: { flash: message } })}
        />
      )}

      <SuccessToast message={flashMessage} onClose={clearFlashMessage} />
    </div>
  )
}

export default CampaignDetailPage
