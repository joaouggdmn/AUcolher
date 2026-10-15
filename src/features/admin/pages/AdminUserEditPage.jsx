import { useParams } from 'react-router-dom'
import { getErrorMessage } from '../../../core/utils/apiError'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import ModeratedNote from '../../../core/components/ui/ModeratedNote'
import Spinner from '../../../core/components/ui/Spinner'
import PanelFormPage from '../../ong/panel/PanelFormPage'
import OngAccountForm from '../../perfil/components/account/OngAccountForm'
import PersonAccountForm from '../../perfil/components/account/PersonAccountForm'
import ModerationEditNotice from '../components/ModerationEditNotice'
import { useAdminUser, useUpdateAdminUser } from '../hooks/useAdmin'
import { useModerationEditDone } from '../hooks/useModerationEditDone'
import { ADMIN_PATHS } from '../panel/adminPaths'

// /admin/usuarios/:id/editar — o admin edita o perfil e o e-mail de login de
// uma pessoa ou ONG, no mesmo formulário de "Minha conta" (sem o Perfil
// AUmatch, que é da pessoa). Salvar fica na página, como em "Minha conta"
function AdminUserEditPage() {
  const { id } = useParams()
  const { data: account, isLoading, error, refetch } = useAdminUser(id)
  const updateUser = useUpdateAdminUser()
  const { backTo } = useModerationEditDone(ADMIN_PATHS.users)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar conta" backTo={backTo} backLabel="Voltar">
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    return (
      <PanelFormPage title="Editar conta" backTo={backTo} backLabel="Voltar">
        <LoadErrorState title="Não foi possível carregar a conta" message={getErrorMessage(error)} onRetry={() => refetch()} />
      </PanelFormPage>
    )
  }

  const AccountForm = account.userType === 'ONG' ? OngAccountForm : PersonAccountForm
  const handleSave = (next) => updateUser.mutateAsync({ id: account.id, email: next.email, account: next })

  return (
    <PanelFormPage title={`Editar ${account.name}`} backTo={backTo} backLabel="Voltar">
      <ModerationEditNotice owner={account.name} />
      <ModeratedNote moderatedAt={account.moderatedAt} size="md" className="mb-6" />
      <AccountForm key={account.id} account={account} onSave={handleSave} />
    </PanelFormPage>
  )
}

export default AdminUserEditPage
