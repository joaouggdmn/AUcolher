import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaLocationDot, FaCircleCheck } from 'react-icons/fa6'
import SaveToCalendarMenu from './SaveToCalendarMenu'
import CalendarDateBadge from './CalendarDateBadge'
import { CATEGORIA_META } from './filters/filterOptions'
import { useEventAttendance } from '../hooks/useEventAttendance'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'

function EventCard({ event, layout = 'grid' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAttending, toggleAttendance } = useEventAttendance()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false)
  const isConfirmed = isAttending(event.id)
  const categoria = CATEGORIA_META[event.category]
  const CategoriaIcon = categoria.icon
  const isList = layout === 'list'

  // A presença fica salva na conta e alimenta "Eventos participados" em
  // Minha conta — sem sessão não há onde guardar, então convida ao login
  const handleConfirmClick = () => {
    if (!toggleAttendance(event.id)) setIsAuthModalOpen(true)
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

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
        <Link to={`/eventos/${event.id}`}>
          <img
            src={event.coverUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110"
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
          <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">{event.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{event.time}</p>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <FaLocationDot size={13} className="text-emerald-600" />
          {event.location.venue}, {event.location.city}
        </div>

        <p className="text-sm text-slate-600">
          Organizado por <span className="font-semibold text-emerald-800">{event.organizer.name}</span>
        </p>

        <div className="relative mt-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirmClick}
            aria-pressed={isConfirmed}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
              isConfirmed
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white'
            }`}
          >
            <FaCircleCheck size={14} />
            {isConfirmed ? 'Presença confirmada' : 'Confirmar presença'}
          </button>

          <SaveToCalendarMenu
            event={event}
            isOpen={isCalendarMenuOpen}
            onToggle={setIsCalendarMenuOpen}
          />
        </div>
      </div>

      {/* Portal: o modal fixed não pode herdar o contexto de empilhamento do card */}
      {isAuthModalOpen &&
        createPortal(
          <AuthRequiredModal
            message="Faça login para confirmar presença e acompanhar seus eventos na sua conta."
            onCancel={() => setIsAuthModalOpen(false)}
            onLogin={handleGoToLogin}
          />,
          document.body
        )}
    </div>
  )
}

export default EventCard