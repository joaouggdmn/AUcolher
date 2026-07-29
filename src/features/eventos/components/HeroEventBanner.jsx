import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import CalendarDateBadge from './CalendarDateBadge'
import { getDateParts } from '../utils/dateHelpers'

function HeroEventBanner({ event }) {
  if (!event) return null
  const { day, monthLabel, weekday } = getDateParts(event.date)

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-8 sm:p-10 lg:p-14">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-[100px]" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 lg:max-w-xl">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-extrabold text-emerald-950">
            <LuSparkles size={13} />
            EM BREVE · EVENTO DO MÊS
          </span>

          <h2 className="font-serif text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
            {event.title}
          </h2>

          <p className="text-emerald-100/80">{event.description}</p>

          <div className="flex items-center gap-2 text-sm font-medium text-emerald-100/70">
            <FaCalendarDays size={14} className="text-amber-300" />
            {weekday}, {day} de {monthLabel} · {event.time} · {event.location.city}
          </div>

          <Link
            to={`/eventos/${event.id}`}
            className="group mt-2 flex w-fit items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-bold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300"
          >
            Ver detalhes
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="hidden shrink-0 lg:block">
          <CalendarDateBadge date={event.date} size="lg" />
        </div>
      </div>
    </section>
  )
}

export default HeroEventBanner