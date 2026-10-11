import { FaHandHoldingHeart } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

function AdminCampaignsPage() {
  return (
    <PanelPage title="Campanhas" description="Campanhas de doação de todas as ONGs e o total arrecadado.">
      <ActivityEmptyState icon={FaHandHoldingHeart} title="Seção em construção" description="Os dados desta seção chegam nos próximos blocos do painel." />
    </PanelPage>
  )
}

export default AdminCampaignsPage
