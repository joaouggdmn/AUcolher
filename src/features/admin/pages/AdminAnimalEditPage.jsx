import { useParams } from 'react-router-dom'
import { getErrorMessage } from '../../../core/utils/apiError'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import AnimalFormWizard from '../../animais/components/create/AnimalFormWizard'
import { useAnimal } from '../../animais/hooks/useAnimais'
import { useAnimalForm } from '../../animais/hooks/useAnimalForm'
import PanelFormPage from '../../ong/panel/PanelFormPage'
import PanelNotice from '../../ong/panel/PanelNotice'
import ModerationEditNotice from '../components/ModerationEditNotice'
import { useUpdateAdminAnimal } from '../hooks/useAdmin'
import { useModerationEditDone } from '../hooks/useModerationEditDone'
import { ADMIN_PATHS } from '../panel/adminPaths'

// Montado só depois que o animal carregou: o formulário nasce com os dados dele
function AdminEditAnimalForm({ animal, backTo, done }) {
  const updateAnimal = useUpdateAdminAnimal()
  const form = useAnimalForm({
    animal,
    onSubmit: (formData, images) => updateAnimal.mutateAsync({ id: animal.id, form: formData, photos: images }),
    onSaved: (saved) => done(`Alterações em ${saved.name} salvas.`),
  })

  return (
    <PanelFormPage title={`Editar ${animal.name}`} backTo={backTo} backLabel="Voltar">
      <ModerationEditNotice owner={animal.ownerName} />
      <AnimalFormWizard form={form} />
    </PanelFormPage>
  )
}

// /admin/animais/:id/editar — o admin edita o anúncio de outra pessoa (o
// adotado e o fora do ar também; o removido não muda mais)
function AdminAnimalEditPage() {
  const { id } = useParams()
  const { data: animal, isLoading, error, refetch } = useAnimal(id)
  const { backTo, done } = useModerationEditDone(ADMIN_PATHS.animals)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar animal" backTo={backTo} backLabel="Voltar">
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    return (
      <PanelFormPage title="Editar animal" backTo={backTo} backLabel="Voltar">
        <LoadErrorState title="Não foi possível carregar o animal" message={getErrorMessage(error)} onRetry={() => refetch()} />
      </PanelFormPage>
    )
  }
  if (animal.status === 'REMOVED') {
    return (
      <PanelFormPage title={`Editar ${animal.name}`} backTo={backTo} backLabel="Voltar">
        <PanelNotice backTo={backTo} backLabel="Voltar">
          Este anúncio foi removido pela moderação e não pode mais ser alterado.
        </PanelNotice>
      </PanelFormPage>
    )
  }

  return <AdminEditAnimalForm key={animal.id} animal={animal} backTo={backTo} done={done} />
}

export default AdminAnimalEditPage
