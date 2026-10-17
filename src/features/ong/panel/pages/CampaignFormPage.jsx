import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { formatCurrency } from '../../../../core/utils/currency'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import CampaignForm from '../../../doacoes/components/CampaignForm'
import { useCampaign, useCreateCampaign, useUpdateCampaign } from '../../../doacoes/hooks/useCampanhas'
import { isCampaignOwner } from '../../../doacoes/utils/campaignDisplay'
import { buildCampaignForm, buildNewCampaignForm } from '../../../doacoes/utils/campaignForm'
import PanelFormPage from '../PanelFormPage'
import PanelNotice from '../PanelNotice'
import { PANEL_PATHS } from '../panelPaths'

const BACK = { backTo: PANEL_PATHS.campaigns, backLabel: 'Voltar para campanhas' }

function NewCampaignForm() {
  const navigate = useNavigate()
  const createCampaign = useCreateCampaign()
  // Formulário novo nasce uma vez só
  const [initialValues] = useState(buildNewCampaignForm)

  const handleSubmit = (values) => {
    createCampaign.mutate(values, {
      onSuccess: () =>
        navigate(PANEL_PATHS.campaigns, { state: { flash: 'Campanha publicada! Ela já recebe doações por PIX.' } }),
    })
  }

  return (
    <PanelFormPage
      title="Criar campanha"
      description="Conte por que a ONG precisa de ajuda. A campanha aparece na vitrine, na página inicial e no perfil da ONG."
      {...BACK}
    >
      <CampaignForm
        initialValues={initialValues}
        submitLabel="Publicar campanha"
        isSubmitting={createCampaign.isPending}
        submitError={createCampaign.error ? getErrorMessage(createCampaign.error) : null}
        onSubmit={handleSubmit}
        cancelTo={PANEL_PATHS.campaigns}
      />
    </PanelFormPage>
  )
}

function EditCampaignForm({ campaign }) {
  const navigate = useNavigate()
  const updateCampaign = useUpdateCampaign()

  const handleSubmit = (values) => {
    updateCampaign.mutate(
      { id: campaign.id, values },
      { onSuccess: () => navigate(PANEL_PATHS.campaigns, { state: { flash: 'Campanha atualizada!' } }) }
    )
  }

  const count = campaign.donationsCount
  const description =
    count > 0
      ? `${count} ${count === 1 ? 'doação' : 'doações'} somando ${formatCurrency(campaign.raisedAmount)}. Quem doou verá as mudanças na página da campanha.`
      : 'As mudanças aparecem na vitrine assim que você salvar.'

  return (
    <PanelFormPage title={`Editar ${campaign.title}`} description={description} {...BACK}>
      <CampaignForm
        initialValues={buildCampaignForm(campaign)}
        raisedAmount={campaign.raisedAmount}
        submitLabel="Salvar alterações"
        isSubmitting={updateCampaign.isPending}
        submitError={updateCampaign.error ? getErrorMessage(updateCampaign.error) : null}
        onSubmit={handleSubmit}
        cancelTo={PANEL_PATHS.campaigns}
      />
    </PanelFormPage>
  )
}

function EditCampaignLoader({ id }) {
  const { user } = useAuth()
  const { data: campaign, isLoading, error, refetch } = useCampaign(id)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar campanha" {...BACK}>
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PanelFormPage title="Editar campanha" {...BACK}>
        <LoadErrorState
          title={notFound ? 'Campanha não encontrada' : 'Não foi possível carregar a campanha'}
          message={notFound ? 'Ela pode ter sido excluída.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PanelFormPage>
    )
  }
  // O backend recusaria o PUT de qualquer jeito (403): isso só evita o formulário inútil
  if (!isCampaignOwner(campaign, user)) {
    return (
      <PanelFormPage title="Editar campanha" {...BACK}>
        <PanelNotice {...BACK}>Só a ONG que criou a campanha pode alterar as informações dela.</PanelNotice>
      </PanelFormPage>
    )
  }
  if (campaign.isClosed) {
    return (
      <PanelFormPage title={`Editar ${campaign.title}`} {...BACK}>
        <PanelNotice {...BACK}>
          Esta campanha está encerrada. Campanhas encerradas ficam como histórico para quem doou e não podem mais ser
          editadas.
        </PanelNotice>
      </PanelFormPage>
    )
  }

  return <EditCampaignForm key={campaign.id} campaign={campaign} />
}

// /ong/painel/campanhas/nova e /ong/painel/campanhas/:id/editar
function CampaignFormPage() {
  const { id } = useParams()
  return id ? <EditCampaignLoader id={id} /> : <NewCampaignForm />
}

export default CampaignFormPage
