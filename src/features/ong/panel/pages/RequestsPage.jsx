import { useNavigate } from 'react-router-dom'
import BarList from '../../../../core/components/charts/BarList'
import ChartCard from '../../../../core/components/charts/ChartCard'
import PanelPage from '../../../../core/components/panel/PanelPage'
import ReceivedRequestsBoard from '../../../adocao/components/ReceivedRequestsBoard'
import { adoptionFunnel } from '../../utils/panelCharts'
import { PANEL_PATHS } from '../panelPaths'
import { useOngPanel } from '../useOngPanel'

function RequestsPage() {
  const navigate = useNavigate()
  const { dashboard, notify } = useOngPanel()

  return (
    <PanelPage
      title="Pedidos de adoção"
      description="Avalie cada interessado, aceite ou recuse, converse e confirme a entrega quando estiver tudo certo."
    >
      {dashboard.requests.length > 0 && (
        <div className="mb-10">
          <ChartCard title="Do pedido à adoção" subtitle="Quantos pedidos chegaram a cada etapa">
            <BarList items={adoptionFunnel(dashboard.requests)} />
          </ChartCard>
        </div>
      )}
      <ReceivedRequestsBoard
        onNotify={notify}
        onGoToChat={(requestId) => navigate(`${PANEL_PATHS.chats}?conversa=${requestId}`)}
      />
    </PanelPage>
  )
}

export default RequestsPage
