import { FaCalendarDays } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

function AdminEventsPage() {
  return (
    <PanelPage title="Eventos" description="Eventos de todas as ONGs: próximos, passados e cancelados.">
      <ActivityEmptyState icon={FaCalendarDays} title="Seção em construção" description="Os dados desta seção chegam nos próximos blocos do painel." />
    </PanelPage>
  )
}

export default AdminEventsPage
