import { useNavigate, useParams } from 'react-router-dom'
import { FaFlagCheckered, FaLock, FaPen } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import Spinner from '../../../core/components/ui/Spinner'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import EventForm from '../components/EventForm'
import EventUnavailableState from '../components/EventUnavailableState'
import { useEvent, useUpdateEvent } from '../hooks/useEventos'
import { buildEventForm } from '../utils/eventForm'

function EventEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: event, isLoading, isError, error, refetch } = useEvent(id)
  const updateEvent = useUpdateEvent()

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    if (error?.response?.status === 404) return <EventUnavailableState />

    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32">
        <LoadErrorState
          title="Não foi possível carregar o evento"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // A rota já exige conta de ONG; aqui confere se é a ONG dona. O backend
  // recusaria o PUT de qualquer jeito (403) — isso só evita o formulário inútil
  if (String(event.organizer.id) !== String(user?.id)) {
    return (
      <EventUnavailableState
        icon={FaLock}
        title="Você não pode editar este evento"
        message="Só a ONG que criou o evento pode alterar as informações dele."
        linkTo={`/eventos/${event.id}`}
        linkLabel="Ver evento"
      />
    )
  }

  if (event.isPast) {
    return (
      <EventUnavailableState
        icon={FaFlagCheckered}
        title="Este evento já aconteceu"
        message="Eventos passados ficam como histórico para quem participou e não podem mais ser editados."
        linkTo={`/eventos/${event.id}`}
        linkLabel="Ver evento"
      />
    )
  }

  const handleSubmit = (values) => {
    updateEvent.mutate(
      { id: event.id, values },
      { onSuccess: () => navigate(`/eventos/${event.id}`, { state: { flash: 'Evento atualizado!' } }) }
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <FaPen size={12} />
          Editar evento
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{event.title}</h1>
        {event.confirmedCount > 0 && (
          <p className="max-w-lg text-sm text-slate-500">
            {event.confirmedCount} {event.confirmedCount === 1 ? 'pessoa já confirmou' : 'pessoas já confirmaram'} presença
            — elas verão as mudanças na página do evento.
          </p>
        )}
      </div>

      <EventForm
        key={event.id}
        initialValues={buildEventForm(event)}
        minCapacity={event.confirmedCount}
        submitLabel="Salvar alterações"
        isSubmitting={updateEvent.isPending}
        submitError={updateEvent.error ? getErrorMessage(updateEvent.error) : null}
        onSubmit={handleSubmit}
        cancelTo={`/eventos/${event.id}`}
      />
    </div>
  )
}

export default EventEditPage
