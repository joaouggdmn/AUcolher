import { FaTableCellsLarge } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

function AdminOverviewPage() {
  return (
    <PanelPage title="Visão geral" description="Como a plataforma está hoje: contas, animais, adoções, doações e eventos.">
      <ActivityEmptyState icon={FaTableCellsLarge} title="Seção em construção" description="Os dados desta seção chegam nos próximos blocos do painel." />
    </PanelPage>
  )
}

export default AdminOverviewPage
