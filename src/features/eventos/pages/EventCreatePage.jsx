import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import EventForm from '../components/EventForm'
import { useCreateEvent } from '../hooks/useEventos'
import { buildNewEventForm } from '../utils/eventForm'

function EventCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createEvent = useCreateEvent()
  // Formulário novo nasce uma vez só, com a cidade da ONG
  const [initialValues] = useState(() => buildNewEventForm(user))

  const handleSubmit = (values) => {
    createEvent.mutate(values, {
      onSuccess: (event) => navigate(`/eventos/${event.id}`, { state: { flash: 'Evento publicado!' } }),
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Divulgar evento
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
          Conte para a comunidade o que vai acontecer
        </h1>
        <p className="max-w-lg text-sm text-slate-500">
          O evento aparece na vitrine de eventos, na página inicial e no perfil da sua ONG.
        </p>
      </div>

      <EventForm
        initialValues={initialValues}
        submitLabel="Publicar evento"
        isSubmitting={createEvent.isPending}
        submitError={createEvent.error ? getErrorMessage(createEvent.error) : null}
        onSubmit={handleSubmit}
        cancelTo="/eventos"
      />
    </div>
  )
}

export default EventCreatePage
