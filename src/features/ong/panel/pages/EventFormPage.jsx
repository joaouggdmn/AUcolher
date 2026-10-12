import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaFlagCheckered } from 'react-icons/fa6'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { isSameId } from '../../../../core/utils/ids'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import EventForm from '../../../eventos/components/EventForm'
import { useCreateEvent, useEvent, useUpdateEvent } from '../../../eventos/hooks/useEventos'
import { buildEventForm, buildNewEventForm } from '../../../eventos/utils/eventForm'
import PanelFormPage from '../PanelFormPage'
import PanelNotice from '../PanelNotice'
import { PANEL_PATHS } from '../panelPaths'

const BACK = { backTo: PANEL_PATHS.events, backLabel: 'Voltar para eventos' }

function NewEventForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createEvent = useCreateEvent()
  // Formulário novo nasce uma vez só, com a cidade da ONG
  const [initialValues] = useState(() => buildNewEventForm(user))

  const handleSubmit = (values) => {
    createEvent.mutate(values, {
      onSuccess: () => navigate(PANEL_PATHS.events, { state: { flash: 'Evento publicado! Ele já aparece na vitrine.' } }),
    })
  }

  return (
    <PanelFormPage
      title="Criar evento"
      description="O evento aparece na vitrine de eventos, na página inicial e no perfil da ONG."
      {...BACK}
    >
      <EventForm
        initialValues={initialValues}
        submitLabel="Publicar evento"
        isSubmitting={createEvent.isPending}
        submitError={createEvent.error ? getErrorMessage(createEvent.error) : null}
        onSubmit={handleSubmit}
        cancelTo={PANEL_PATHS.events}
      />
    </PanelFormPage>
  )
}

function EditEventForm({ event }) {
  const navigate = useNavigate()
  const updateEvent = useUpdateEvent()

  const handleSubmit = (values) => {
    updateEvent.mutate(
      { id: event.id, values },
      { onSuccess: () => navigate(PANEL_PATHS.events, { state: { flash: 'Evento atualizado!' } }) }
    )
  }

  const confirmed = event.confirmedCount
  const description =
    confirmed > 0
      ? `${confirmed} ${confirmed === 1 ? 'pessoa já confirmou' : 'pessoas já confirmaram'} presença — elas verão as mudanças na página do evento.`
      : 'As mudanças aparecem na vitrine assim que você salvar.'

  return (
    <PanelFormPage title={`Editar ${event.title}`} description={description} {...BACK}>
      <EventForm
        initialValues={buildEventForm(event)}
        minCapacity={confirmed}
        submitLabel="Salvar alterações"
        isSubmitting={updateEvent.isPending}
        submitError={updateEvent.error ? getErrorMessage(updateEvent.error) : null}
        onSubmit={handleSubmit}
        cancelTo={PANEL_PATHS.events}
      />
    </PanelFormPage>
  )
}

function EditEventLoader({ id }) {
  const { user } = useAuth()
  const { data: event, isLoading, error, refetch } = useEvent(id)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar evento" {...BACK}>
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PanelFormPage title="Editar evento" {...BACK}>
        <LoadErrorState
          title={notFound ? 'Evento não encontrado' : 'Não foi possível carregar o evento'}
          message={notFound ? 'Ele pode ter sido cancelado ou excluído.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PanelFormPage>
    )
  }
  // O backend recusaria o PUT de qualquer jeito (403): isso só evita o formulário inútil
  if (!isSameId(event.organizer.id, user?.id)) {
    return (
      <PanelFormPage title="Editar evento" {...BACK}>
        <PanelNotice {...BACK}>Só a ONG que criou o evento pode alterar as informações dele.</PanelNotice>
      </PanelFormPage>
    )
  }
  if (event.isPast) {
    return (
      <PanelFormPage title={`Editar ${event.title}`} {...BACK}>
        <PanelNotice icon={FaFlagCheckered} {...BACK}>
          Este evento já aconteceu. Eventos passados ficam como histórico para quem participou e não podem mais ser
          editados.
        </PanelNotice>
      </PanelFormPage>
    )
  }

  return <EditEventForm key={event.id} event={event} />
}

// /ong/painel/eventos/novo e /ong/painel/eventos/:id/editar
function EventFormPage() {
  const { id } = useParams()
  return id ? <EditEventLoader id={id} /> : <NewEventForm />
}

export default EventFormPage
