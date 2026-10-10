import { FaPlus } from 'react-icons/fa6'
import OngCampaignsPanel from '../../components/dashboard/OngCampaignsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function CampaignsPage() {
  const { dashboard, notify } = useOngPanel()
  const { campaigns, queries } = dashboard

  return (
    <PanelPage
      title="Campanhas"
      description="As ativas aparecem na vitrine e no perfil da ONG e recebem doações por PIX. Edite, encerre antes do prazo ou exclua. As encerradas ficam como histórico."
      actions={[{ to: '/campanhas/criar', label: 'Criar campanha', icon: FaPlus }]}
    >
      <OngCampaignsPanel
        campaigns={campaigns}
        isLoading={queries.campaigns.isLoading}
        error={queries.campaigns.error}
        onRetry={() => queries.campaigns.refetch()}
        onNotify={notify}
      />
    </PanelPage>
  )
}

export default CampaignsPage
