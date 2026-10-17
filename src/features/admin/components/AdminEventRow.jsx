import { Link } from 'react-router-dom'
import { FaEye, FaPen, FaLocationDot, FaTrashCan } from 'react-icons/fa6'
import CalendarDateBadge from '../../eventos/components/CalendarDateBadge'
import { getCategoriaMeta } from '../../eventos/components/filters/filterOptions'
import { formatTimeRange } from '../../eventos/utils/dateHelpers'
import { getAttendanceSummary } from '../../eventos/utils/eventDisplay'
import { canEdit, canRemove, EVENT_STATUS_META, eventStatus, hasPublicPage } from '../utils/listStatus'
import { ADMIN_PATHS } from '../panel/adminPaths'

const ACTION_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50'
const REMOVE_CLASSES =
  'flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50'

const SUMMARY_TONES = {
  neutral: 'text-slate-500',
  few: 'text-amber-600',
  full: 'text-rose-600',
}

// Um evento na lista do admin: quando, onde, de qual ONG e quantos
// confirmaram. Cancelado ou de ONG banida não tem mais página pública, então
// fica sem link
function AdminEventRow({ event, onRemove }) {
  const statusKey = eventStatus(event)
  const status = EVENT_STATUS_META[statusKey]
  const summary = getAttendanceSummary(event, { invite: false })

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDateBadge date={event.date} size="sm" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">{event.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
          </div>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
            <FaLocationDot size={10} className="shrink-0 text-emerald-600" />
            {formatTimeRange(event.startTime, event.endTime)} · {event.location.venue}, {event.location.city}
          </p>
          <p className="truncate text-xs text-slate-500">
            {getCategoriaMeta(event.category, event.customCategory).label} ·{' '}
            <Link to={`/ong/${event.organizer.id}`} className="font-bold text-emerald-800 hover:underline">
              {event.organizer.name}
            </Link>
          </p>
          <p className={`mt-1 text-xs font-semibold ${statusKey === 'UPCOMING' ? SUMMARY_TONES[summary.tone] : 'text-slate-500'}`}>
            {statusKey === 'UPCOMING'
              ? summary.label
              : `${event.confirmedCount} ${event.confirmedCount === 1 ? 'pessoa tinha confirmado' : 'pessoas tinham confirmado'}`}
          </p>
        </div>
      </div>

      {canRemove(statusKey) && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {hasPublicPage(statusKey) && (
            <Link to={`/eventos/${event.id}`} className={ACTION_CLASSES}>
              <FaEye size={11} />
              Ver evento
            </Link>
          )}
          {canEdit(statusKey) && (
            <Link to={ADMIN_PATHS.eventEdit(event.id)} className={ACTION_CLASSES}>
              <FaPen size={10} />
              Editar
            </Link>
          )}
          <button type="button" onClick={() => onRemove(event)} className={REMOVE_CLASSES}>
            <FaTrashCan size={11} />
            Remover
          </button>
        </div>
      )}
    </li>
  )
}

export default AdminEventRow
