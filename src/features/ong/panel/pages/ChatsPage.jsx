import OngConversationsPanel from '../../components/dashboard/OngConversationsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function ChatsPage() {
  const { dashboard } = useOngPanel()

  return (
    <PanelPage
      title="Conversas"
      description="Chats com quem quer adotar os animais da ONG, das conversas mais recentes para as mais antigas."
      actions={[{ to: '/chat', label: 'Abrir chat' }]}
    >
      <OngConversationsPanel conversations={dashboard.conversations} />
    </PanelPage>
  )
}

export default ChatsPage
