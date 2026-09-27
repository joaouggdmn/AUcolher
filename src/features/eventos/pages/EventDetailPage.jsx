import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaMapLocationDot,
  FaPen,
  FaTrashCan,
  FaUserGroup,
} from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import Spinner from '../../../core/components/ui/Spinner'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import VerifiedBadge from '../../ong/components/VerifiedBadge'
import AttendanceButton from '../components/AttendanceButton'
import CalendarDateBadge from '../components/CalendarDateBadge'
import DeleteEventDialog from '../components/DeleteEventDialog'
import EventCover from '../components/EventCover'
import EventUnavailableState from '../components/EventUnavailableState'
import SaveToCalendarMenu from '../components/SaveToCalendarMenu'
import { getCategoriaMeta } from '../components/filters/filterOptions'
import { useEvent } from '../hooks/useEventos'
import { formatLongDate, formatTimeRange } from '../utils/dateHelpers'
import { buildMapsUrl, formatEventAddress, getAttendanceSummary } from '../utils/eventDisplay'

const SUMMARY_TONES = {
  neutral: 'text-slate-600',
  few: 'text-amber-600',
  full: 'text-rose-600',
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={14} />
      </span>
      <div className="min-w-0 pt-1.5 text-sm text-slate-600">{children}</div>
    </div>
  )
}

function OrganizerCard({ organizer }) {
  return (
    <Link
      to={`/ong/${organizer.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-emerald-950/5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-700 text-sm font-black text-white">
        {organizer.photoUrl ? (
          <img src={organizer.photoUrl} alt={organizer.name} className="h-full w-full object-cover" />
        ) : (
          organizer.name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Organizado por</p>
        <p className="truncate text-sm font-bold text-emerald-950">{organizer.name}</p>
        {organizer.isVerified && (
          <div className="mt-1">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </div>
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-700">
        Ver perfil
        <FaArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { data: event, isLoading, isError, error, refetch } = useEvent(id)
  const navigate = useNavigate()
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  // "Evento publicado!" / "Evento atualizado!" vindo do formulário
  const [flashMessage, setFlashMessage] = useState(location.state?.flash ?? null)
  const clearFlashMessage = useCallback(() => setFlashMessage(null), [])

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    // 404 = não existe ou foi cancelado (exclusão lógica)
    if (error?.response?.status === 404) return <EventUnavailableState />

    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32">
        <LoadErrorState
          title="Não foi possível carregar o evento"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  const categoria = getCategoriaMeta(event.category)
  const CategoriaIcon = categoria.icon
  const summary = getAttendanceSummary(event)
  const address = formatEventAddress(event.location)
  const isOwner = user != null && String(user.id) === String(event.organizer.id)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Link
        to="/eventos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition-colors duration-300 hover:text-emerald-600"
      >
        <FaArrowLeft size={12} />
        Todos os eventos
      </Link>

      <div className="relative h-56 overflow-hidden rounded-3xl shadow-lg shadow-emerald-950/10 sm:h-80">
        <EventCover event={event} />
        <div className="absolute left-5 top-5">
          <CalendarDateBadge date={event.date} size="lg" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${categoria.className}`}>
                <CategoriaIcon size={12} />
                {categoria.label}
              </span>
              {event.isPast && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  Evento encerrado
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">{event.title}</h1>
          </header>

          <section>
            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">Sobre o evento</h2>
            <p className="mt-2 whitespace-pre-line break-words leading-relaxed text-slate-600">{event.description}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">Local</h2>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="font-bold text-emerald-950">{event.location.venue}</p>
              <p className="mt-1 text-sm text-slate-600">{address}</p>
              {event.location.cep && <p className="mt-0.5 text-sm text-slate-400">CEP {event.location.cep}</p>}
              <a
                href={buildMapsUrl(event.location)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-800 hover:text-white"
              >
                <FaMapLocationDot size={14} />
                Abrir no Google Maps
              </a>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-emerald-950/5">
            <InfoRow icon={FaCalendarDays}>
              <span className="block font-semibold text-emerald-950 first-letter:uppercase">{formatLongDate(event.date)}</span>
            </InfoRow>
            <InfoRow icon={FaClock}>{formatTimeRange(event.startTime, event.endTime)}</InfoRow>
            <InfoRow icon={FaLocationDot}>
              {event.location.venue}, {event.location.city} - {event.location.state}
            </InfoRow>
            <InfoRow icon={FaUserGroup}>
              <span className={`font-semibold ${SUMMARY_TONES[summary.tone]}`}>{summary.label}</span>
            </InfoRow>

            <div className="relative flex items-center gap-2 pt-1">
              <AttendanceButton event={event} size="lg" className="flex-1" />
              <SaveToCalendarMenu event={event} isOpen={isCalendarMenuOpen} onToggle={setIsCalendarMenuOpen} />
            </div>

            {isOwner && !event.isPast && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/eventos/editar/${event.id}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 py-3 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50"
                >
                  <FaPen size={12} />
                  Editar evento
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 py-3 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                >
                  <FaTrashCan size={12} />
                  Excluir
                </button>
              </div>
            )}
          </div>

          <OrganizerCard organizer={event.organizer} />
        </aside>
      </div>

      {isDeleteOpen && (
        <DeleteEventDialog
          event={event}
          onClose={() => setIsDeleteOpen(false)}
          // A página do evento deixa de existir: volta para o painel com o aviso
          onDeleted={(message) => navigate('/ong/dashboard', { state: { flash: message } })}
        />
      )}

      <SuccessToast message={flashMessage} onClose={clearFlashMessage} />
    </div>
  )
}

export default EventDetailPage
