import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaLocationDot, FaShieldHalved, FaUserGroup } from 'react-icons/fa6'
import SaveToCalendarMenu from './SaveToCalendarMenu'
import CalendarDateBadge from './CalendarDateBadge'
import EventCover from './EventCover'
import AttendanceButton from './AttendanceButton'
import { getCategoriaMeta } from './filters/filterOptions'
import { formatTimeRange } from '../utils/dateHelpers'
import { getAttendanceSummary } from '../utils/eventDisplay'

const SUMMARY_TONES = {
  neutral: 'text-slate-500',
  few: 'text-amber-600',
  full: 'text-rose-600',
}

function EventCard({ event, layout = 'grid' }) {
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false)
  const categoria = getCategoriaMeta(event.category)
  const CategoriaIcon = categoria.icon
  const summary = getAttendanceSummary(event)
  const isList = layout === 'list'

  return (
    // z-index dinâmico: z-30 quando o dropdown está aberto eleva o card INTEIRO
    // acima dos cards vizinhos no grid; z-0 em repouso mantém o empilhamento normal
    <div
      className={`group relative flex rounded-3xl bg-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-400
                  transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                  hover:shadow-2xl hover:shadow-emerald-950/20 hover:ring-amber-300
                  ${isCalendarMenuOpen ? 'z-30' : 'z-0'}
                  ${isList ? 'flex-col sm:flex-row' : 'flex-col'}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          isList
            ? 'h-48 rounded-t-3xl sm:h-auto sm:w-64 sm:rounded-l-3xl sm:rounded-tr-none'
            : 'h-48 w-full rounded-t-3xl'
        }`}
      >
        <Link to={`/eventos/${event.id}`} className="block h-full">
          <EventCover
            event={event}
            className="transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
          />
        </Link>

        <div className="absolute left-4 top-4 z-10">
          <CalendarDateBadge date={event.date} size="md" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${categoria.className}`}>
          <CategoriaIcon size={11} />
          {categoria.label}
        </span>

        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">
            <Link to={`/eventos/${event.id}`} className="transition-colors duration-300 hover:text-emerald-700">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-slate-500">{formatTimeRange(event.startTime, event.endTime)}</p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <FaLocationDot size={13} className="shrink-0 text-emerald-600" />
          <span className="truncate">
            {event.location.venue}, {event.location.city}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          Organizado por
          <Link
            to={`/ong/${event.organizer.id}`}
            className="flex items-center gap-1 font-semibold text-emerald-800 transition-colors duration-300 hover:text-emerald-600"
          >
            {event.organizer.name}
            {event.organizer.isVerified && (
              <FaShieldHalved size={11} className="shrink-0 text-amber-500" title="Instituição verificada" />
            )}
          </Link>
        </p>

        <p className={`flex items-center gap-1.5 text-xs font-semibold ${SUMMARY_TONES[summary.tone]}`}>
          <FaUserGroup size={12} className="shrink-0" />
          {summary.label}
        </p>

        <div className="relative mt-auto flex items-center gap-2">
          <AttendanceButton event={event} className="flex-1" />

          <SaveToCalendarMenu
            event={event}
            isOpen={isCalendarMenuOpen}
            onToggle={setIsCalendarMenuOpen}
          />
        </div>
      </div>
    </div>
  )
}

export default EventCard
