import OngAdoptionsPanel from '../../components/dashboard/OngAdoptionsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function RequestsPage() {
  const { dashboard } = useOngPanel()

  return (
    <PanelPage
      title="Pedidos de adoção"
      description="Quem quer adotar os animais da ONG, em cada etapa. Para aceitar ou recusar um pedido, abra Interesses recebidos."
      actions={[{ to: '/interesses-recebidos', label: 'Interesses recebidos' }]}
    >
      <OngAdoptionsPanel requests={dashboard.requests} />
    </PanelPage>
  )
}

export default RequestsPage
