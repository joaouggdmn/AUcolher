import { FaClock, FaLocationDot } from 'react-icons/fa6'
import CalendarDateBadge from '../../../eventos/components/CalendarDateBadge'
import AttendanceButton from '../../../eventos/components/AttendanceButton'

// Mesmo papel do "Doar" das campanhas: o botão de presença do /eventos, em
// formato de pílula. No mobile ele desce para baixo do texto
function OngEventItem({ event }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:gap-4 sm:pr-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDateBadge date={event.date} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-emerald-950">{event.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FaLocationDot aria-hidden="true" size={10} className="text-emerald-600" />
              {event.location?.venue}, {event.location?.city}
            </span>
            {event.time && (
              <span className="flex items-center gap-1">
                <FaClock aria-hidden="true" size={10} className="text-emerald-600" />
                {event.time}
              </span>
            )}
          </p>
        </div>
      </div>

      <AttendanceButton event={event} size="sm" idleLabel="Participar do evento" className="shrink-0" />
    </li>
  )
}

export default OngEventItem
