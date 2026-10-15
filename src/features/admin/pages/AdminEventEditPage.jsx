import { useParams } from 'react-router-dom'
import { FaFlagCheckered } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import EventForm from '../../eventos/components/EventForm'
import { useEvent } from '../../eventos/hooks/useEventos'
import { buildEventForm } from '../../eventos/utils/eventForm'
import PanelFormPage from '../../ong/panel/PanelFormPage'
import PanelNotice from '../../ong/panel/PanelNotice'
import ModerationEditNotice from '../components/ModerationEditNotice'
import { useUpdateAdminEvent } from '../hooks/useAdmin'
import { useModerationEditDone } from '../hooks/useModerationEditDone'
import { ADMIN_PATHS } from '../panel/adminPaths'

function AdminEditEventForm({ event, backTo, done }) {
  const updateEvent = useUpdateAdminEvent()

  const handleSubmit = (values) => {
    updateEvent.mutate({ id: event.id, values }, { onSuccess: () => done('Evento atualizado!') })
  }

  return (
    <PanelFormPage title={`Editar ${event.title}`} backTo={backTo} backLabel="Voltar">
      <ModerationEditNotice owner={event.organizer.name} />
      <EventForm
        initialValues={buildEventForm(event)}
        minCapacity={event.confirmedCount}
        submitLabel="Salvar alterações"
        isSubmitting={updateEvent.isPending}
        submitError={updateEvent.error ? getErrorMessage(updateEvent.error) : null}
        onSubmit={handleSubmit}
        cancelTo={backTo}
      />
    </PanelFormPage>
  )
}

// /admin/eventos/:id/editar — o admin edita o evento de uma ONG, com as
// regras dela: só o ativo e que ainda não aconteceu
function AdminEventEditPage() {
  const { id } = useParams()
  const { data: event, isLoading, error, refetch } = useEvent(id)
  const { backTo, done } = useModerationEditDone(ADMIN_PATHS.events)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar evento" backTo={backTo} backLabel="Voltar">
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PanelFormPage title="Editar evento" backTo={backTo} backLabel="Voltar">
        <LoadErrorState
          title={notFound ? 'Evento não encontrado' : 'Não foi possível carregar o evento'}
          message={notFound ? 'Ele pode ter sido cancelado ou removido.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PanelFormPage>
    )
  }
  if (event.isPast) {
    return (
      <PanelFormPage title={`Editar ${event.title}`} backTo={backTo} backLabel="Voltar">
        <PanelNotice icon={FaFlagCheckered} backTo={backTo} backLabel="Voltar">
          Este evento já aconteceu: fica como histórico e não pode mais ser editado.
        </PanelNotice>
      </PanelFormPage>
    )
  }

  return <AdminEditEventForm key={event.id} event={event} backTo={backTo} done={done} />
}

export default AdminEventEditPage
