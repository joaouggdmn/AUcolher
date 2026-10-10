import { useNavigate, useParams } from 'react-router-dom'
import { FaLock, FaPen } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import Spinner from '../../../core/components/ui/Spinner'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import CampaignForm from '../components/CampaignForm'
import CampaignUnavailableState from '../components/CampaignUnavailableState'
import { useCampaign, useUpdateCampaign } from '../hooks/useCampanhas'
import { buildCampaignForm } from '../utils/campaignForm'
import { isCampaignOwner } from '../utils/campaignDisplay'

function CampaignEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: campaign, isLoading, isError, error, refetch } = useCampaign(id)
  const updateCampaign = useUpdateCampaign()

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    )
  }

  if (isError) {
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

  // A rota já exige conta de ONG; aqui confere se é a ONG dona. O backend
  // recusaria o PUT de qualquer jeito (403) — isso só evita o formulário inútil
  if (!isCampaignOwner(campaign, user)) {
    return (
      <CampaignUnavailableState
        icon={FaLock}
        title="Você não pode editar esta campanha"
        message="Só a ONG que criou a campanha pode alterar as informações dela."
        linkTo={`/campanhas/${campaign.id}`}
        linkLabel="Ver campanha"
      />
    )
  }

  if (campaign.isClosed) {
    return (
      <CampaignUnavailableState
        icon={FaLock}
        title="Esta campanha está encerrada"
        message="Campanhas encerradas ficam como histórico para quem doou e não podem mais ser editadas."
        linkTo={`/campanhas/${campaign.id}`}
        linkLabel="Ver campanha"
      />
    )
  }

  const handleSubmit = (values) => {
    updateCampaign.mutate(
      { id: campaign.id, values },
      { onSuccess: () => navigate(`/campanhas/${campaign.id}`, { state: { flash: 'Campanha atualizada!' } }) }
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <FaPen size={12} />
          Editar campanha
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{campaign.title}</h1>
        {campaign.donationsCount > 0 && (
          <p className="max-w-lg text-sm text-slate-500">
            {campaign.donationsCount} {campaign.donationsCount === 1 ? 'doação' : 'doações'} somando{' '}
            {formatCurrency(campaign.raisedAmount)} — quem doou verá as mudanças na página da campanha.
          </p>
        )}
      </div>

      <CampaignForm
        key={campaign.id}
        initialValues={buildCampaignForm(campaign)}
        raisedAmount={campaign.raisedAmount}
        submitLabel="Salvar alterações"
        isSubmitting={updateCampaign.isPending}
        submitError={updateCampaign.error ? getErrorMessage(updateCampaign.error) : null}
        onSubmit={handleSubmit}
        cancelTo={`/campanhas/${campaign.id}`}
      />
    </div>
  )
}

export default CampaignEditPage
