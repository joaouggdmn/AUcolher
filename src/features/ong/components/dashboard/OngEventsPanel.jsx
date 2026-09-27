import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarPlus, FaLocationDot, FaPen, FaTrashCan, FaUserGroup } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import CalendarDateBadge from '../../../eventos/components/CalendarDateBadge'
import DeleteEventDialog from '../../../eventos/components/DeleteEventDialog'
import { formatTimeRange } from '../../../eventos/utils/dateHelpers'
import { getAttendanceSummary } from '../../../eventos/utils/eventDisplay'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import EventParticipantsModal from './EventParticipantsModal'

const SUMMARY_TONES = {
  neutral: 'text-slate-500',
  few: 'text-amber-600',
  full: 'text-rose-600',
}

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-300'

// Passado fica só como histórico: dá para ver quem confirmou, mas não editar
// nem excluir (o backend recusaria)
function OngEventRow({ event, onShowParticipants, onDelete }) {
  const summary = getAttendanceSummary(event)

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDateBadge date={event.date} size="sm" />
        <div className="min-w-0">
          <Link
            to={`/eventos/${event.id}`}
            className="block truncate text-base font-extrabold tracking-tight text-emerald-950 transition-colors duration-300 hover:text-emerald-700"
          >
            {event.title}
          </Link>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
            <FaLocationDot size={10} className="shrink-0 text-emerald-600" />
            {formatTimeRange(event.startTime, event.endTime)} · {event.location.venue}, {event.location.city}
          </p>
          <p className={`mt-1 text-xs font-semibold ${SUMMARY_TONES[summary.tone]}`}>{summary.label}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onShowParticipants(event)}
          className={`${ACTION_CLASSES} border-emerald-200 text-emerald-800 hover:bg-emerald-50`}
        >
          <FaUserGroup size={11} />
          Confirmados ({event.confirmedCount})
        </button>
        {!event.isPast && (
          <>
            <Link
              to={`/eventos/editar/${event.id}`}
              className={`${ACTION_CLASSES} border-slate-200 text-slate-600 hover:bg-slate-50`}
            >
              <FaPen size={10} />
              Editar
            </Link>
            <button
              type="button"
              onClick={() => onDelete(event)}
              className={`${ACTION_CLASSES} border-rose-200 text-rose-600 hover:bg-rose-50`}
            >
              <FaTrashCan size={10} />
              Excluir
            </button>
          </>
        )}
      </div>
    </li>
  )
}

function EventGroup({ title, events, ...rowProps }) {
  if (events.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
        {title} <span className="text-slate-400">({events.length})</span>
      </h3>
      <ul className="flex flex-col gap-3">
        {events.map((event) => (
          <OngEventRow key={event.id} event={event} {...rowProps} />
        ))}
      </ul>
    </div>
  )
}

// Aba "Eventos" do painel. `events` já vem dividido em próximos e realizados
function OngEventsPanel({ events, isLoading, error, onRetry, onNotify }) {
  const [participantsEvent, setParticipantsEvent] = useState(null)
  const [eventToDelete, setEventToDelete] = useState(null)

  if (isLoading) return <Spinner />
  if (error) {
    return <LoadErrorState title="Não foi possível carregar seus eventos" message={getErrorMessage(error)} onRetry={onRetry} />
  }

  if (events.upcoming.length === 0 && events.past.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaCalendarPlus}
        title="Sua ONG ainda não divulgou nenhum evento."
        description="Feiras de adoção, mutirões e bazares aparecem na vitrine de eventos e na página inicial."
        action={{ to: '/eventos/criar', label: 'Criar primeiro evento', icon: FaCalendarPlus }}
      />
    )
  }

  const rowProps = { onShowParticipants: setParticipantsEvent, onDelete: setEventToDelete }

  return (
    <div className="flex flex-col gap-8">
      <EventGroup title="Próximos" events={events.upcoming} {...rowProps} />
      <EventGroup title="Já realizados" events={events.past} {...rowProps} />

      {participantsEvent && (
        <EventParticipantsModal event={participantsEvent} onClose={() => setParticipantsEvent(null)} />
      )}

      {eventToDelete && (
        <DeleteEventDialog
          event={eventToDelete}
          onClose={() => setEventToDelete(null)}
          onDeleted={(message) => {
            setEventToDelete(null)
            onNotify(message)
          }}
        />
      )}
    </div>
  )
}

export default OngEventsPanel
