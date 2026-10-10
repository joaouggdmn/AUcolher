import { FaPlus } from 'react-icons/fa6'
import OngEventsPanel from '../../components/dashboard/OngEventsPanel'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function EventsPage() {
  const { dashboard, notify } = useOngPanel()
  const { events, queries } = dashboard

  return (
    <PanelPage
      title="Eventos"
      description="Os próximos aparecem na vitrine e no perfil da ONG. Veja quem confirmou presença, edite ou cancele. Os já realizados ficam como histórico."
      actions={[{ to: '/eventos/criar', label: 'Criar evento', icon: FaPlus }]}
    >
      <OngEventsPanel
        events={events}
        isLoading={queries.events.isLoading}
        error={queries.events.error}
        onRetry={() => queries.events.refetch()}
        onNotify={notify}
      />
    </PanelPage>
  )
}

export default EventsPage
