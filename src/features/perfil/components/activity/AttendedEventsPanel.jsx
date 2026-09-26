import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarCheck, FaLocationDot } from 'react-icons/fa6'
import CalendarDateBadge from '../../../eventos/components/CalendarDateBadge'
import { CATEGORIA_META } from '../../../eventos/components/filters/filterOptions'
import ActivityEmptyState from './ActivityEmptyState'

function EventRow({ event }) {
  const categoria = CATEGORIA_META[event.category]
  const CategoriaIcon = categoria.icon

  return (
    <Link
      to={`/eventos/${event.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/10"
    >
      <CalendarDateBadge date={event.date} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{event.title}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
          <FaLocationDot size={10} className="shrink-0 text-emerald-600" />
          {event.location.venue}, {event.location.city} · {event.organizer.name}
        </p>
        <span
          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${categoria.className}`}
        >
          <CategoriaIcon size={9} />
          {categoria.label}
        </span>
      </div>
      <FaArrowRight
        size={13}
        className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </Link>
  )
}

function EventGroup({ title, events }) {
  if (events.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
        {title} <span className="text-slate-400">({events.length})</span>
      </h3>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {events.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

function AttendedEventsPanel({ events }) {
  if (events.upcoming.length === 0 && events.past.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaCalendarCheck}
        title="Você ainda não confirmou presença em nenhum evento."
        description="Confirme presença em feiras, mutirões e workshops e acompanhe aqui os próximos e os que já aconteceram."
        action={{ to: '/eventos', label: 'Explorar eventos' }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <EventGroup title="Presença confirmada" events={events.upcoming} />
      <EventGroup title="Já participou" events={events.past} />
    </div>
  )
}

export default AttendedEventsPanel
