import { useParams } from 'react-router-dom'
import { getErrorMessage } from '../../../core/utils/apiError'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import CampaignForm from '../../doacoes/components/CampaignForm'
import { useCampaign, useCampaigns } from '../../doacoes/hooks/useCampanhas'
import { findOtherUrgentCampaign } from '../../doacoes/utils/campanhaRules'
import { buildCampaignForm } from '../../doacoes/utils/campaignForm'
import PanelFormPage from '../../ong/panel/PanelFormPage'
import PanelNotice from '../../ong/panel/PanelNotice'
import ModerationEditNotice from '../components/ModerationEditNotice'
import { useUpdateAdminCampaign } from '../hooks/useAdmin'
import { useModerationEditDone } from '../hooks/useModerationEditDone'
import { ADMIN_PATHS } from '../panel/adminPaths'

function AdminEditCampaignForm({ campaign, backTo, done }) {
  const updateCampaign = useUpdateAdminCampaign()
  // Vale a mesma regra da ONG: uma campanha urgente ativa por vez
  const { data: ngoCampaigns = [] } = useCampaigns({ ongId: campaign.ong.id })
  const urgentConflict = findOtherUrgentCampaign(ngoCampaigns, campaign.id)

  const handleSubmit = (values) => {
    updateCampaign.mutate({ id: campaign.id, values }, { onSuccess: () => done('Campanha atualizada!') })
  }

  return (
    <PanelFormPage title={`Editar ${campaign.title}`} backTo={backTo} backLabel="Voltar">
      <ModerationEditNotice owner={campaign.ong.name} />
      <CampaignForm
        initialValues={buildCampaignForm(campaign)}
        raisedAmount={campaign.raisedAmount}
        urgentConflict={urgentConflict}
        submitLabel="Salvar alterações"
        isSubmitting={updateCampaign.isPending}
        submitError={updateCampaign.error ? getErrorMessage(updateCampaign.error) : null}
        onSubmit={handleSubmit}
        cancelTo={backTo}
      />
    </PanelFormPage>
  )
}

// /admin/campanhas/:id/editar — o admin edita a campanha de uma ONG (por
// enquanto no mock: o backend ainda não tem campanhas). Encerrada não muda
function AdminCampaignEditPage() {
  const { id } = useParams()
  const { data: campaign, isLoading, error, refetch } = useCampaign(id)
  const { backTo, done } = useModerationEditDone(ADMIN_PATHS.campaigns)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar campanha" backTo={backTo} backLabel="Voltar">
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PanelFormPage title="Editar campanha" backTo={backTo} backLabel="Voltar">
        <LoadErrorState
          title={notFound ? 'Campanha não encontrada' : 'Não foi possível carregar a campanha'}
          message={notFound ? 'Ela pode ter sido excluída ou removida.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PanelFormPage>
    )
  }
  if (campaign.isClosed) {
    return (
      <PanelFormPage title={`Editar ${campaign.title}`} backTo={backTo} backLabel="Voltar">
        <PanelNotice backTo={backTo} backLabel="Voltar">
          Esta campanha está encerrada: fica como histórico para quem doou e não pode mais ser editada.
        </PanelNotice>
      </PanelFormPage>
    )
  }

  return <AdminEditCampaignForm key={campaign.id} campaign={campaign} backTo={backTo} done={done} />
}

export default AdminCampaignEditPage
