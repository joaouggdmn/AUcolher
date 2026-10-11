import { FaPaw } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

function AdminAnimalsPage() {
  return (
    <PanelPage title="Animais" description="Todos os anúncios da plataforma e a situação de cada um.">
      <ActivityEmptyState icon={FaPaw} title="Seção em construção" description="Os dados desta seção chegam nos próximos blocos do painel." />
    </PanelPage>
  )
}

export default AdminAnimalsPage
