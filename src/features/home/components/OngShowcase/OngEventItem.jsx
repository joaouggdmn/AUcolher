import { FaClock, FaLocationDot } from 'react-icons/fa6'
import CalendarDateBadge from '../../../eventos/components/CalendarDateBadge'

function OngEventItem({ event }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 ring-1 ring-slate-200/70">
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
    </li>
  )
}

export default OngEventItem
