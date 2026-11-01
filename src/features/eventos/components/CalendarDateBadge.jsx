import { getDateParts } from '../utils/dateHelpers'

const SIZES = {
  sm: { wrapper: 'w-14', top: 'py-1 text-[9px]', day: 'py-1 text-xl' },
  md: { wrapper: 'w-16', top: 'py-1 text-[10px]', day: 'py-1.5 text-2xl' },
  lg: { wrapper: 'w-24', top: 'py-2 text-xs', day: 'py-3 text-4xl' },
}

function CalendarDateBadge({ date, size = 'md' }) {
  const { day, monthLabel } = getDateParts(date)
  const s = SIZES[size]

  return (
    <div className={`overflow-hidden rounded-control bg-white text-center shadow-lg ring-1 ring-black/5 ${s.wrapper}`}>
      <div className={`bg-brand-700 font-bold uppercase tracking-wide text-white ${s.top}`}>
        {monthLabel}
      </div>
      <div className={`font-black leading-none text-brand-950 ${s.day}`}>{day}</div>
    </div>
  )
}

export default CalendarDateBadge