import { FaUsers } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

function AdminUsersPage() {
  return (
    <PanelPage title="Usuários" description="Todas as contas da plataforma: pessoas e ONGs.">
      <ActivityEmptyState icon={FaUsers} title="Seção em construção" description="Os dados desta seção chegam nos próximos blocos do painel." />
    </PanelPage>
  )
}

export default AdminUsersPage
