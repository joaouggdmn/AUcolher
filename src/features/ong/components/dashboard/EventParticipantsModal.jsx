import { createPortal } from 'react-dom'
import { FaUserGroup, FaXmark } from 'react-icons/fa6'
import { getErrorMessage } from '../../../../core/utils/apiError'
import Spinner from '../../../../core/components/ui/Spinner'
import { useEventParticipants } from '../../../eventos/hooks/useEventos'
import { getAttendanceSummary } from '../../../eventos/utils/eventDisplay'

function formatConfirmedAt(isoDateTime) {
  return new Date(isoDateTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function ParticipantRow({ participant }) {
  const { user, confirmedAt } = participant

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-black text-white">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-emerald-950">{user.name}</span>
      <span className="shrink-0 text-xs text-slate-400">Confirmou em {formatConfirmedAt(confirmedAt)}</span>
    </li>
  )
}

// Lista de quem confirmou presença — só a ONG dona enxerga (a API devolve 403
// para qualquer outra conta)
function EventParticipantsModal({ event, onClose }) {
  const { data: participants, isLoading, isError, error } = useEventParticipants(event.id)

  let content
  if (isLoading) content = <Spinner />
  else if (isError) content = <p className="py-8 text-center text-sm text-rose-600">{getErrorMessage(error)}</p>
  else if (participants.length === 0) {
    content = (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaUserGroup size={18} />
        </span>
        <p className="text-sm font-semibold text-slate-600">Ninguém confirmou presença ainda.</p>
      </div>
    )
  } else {
    content = (
      <ul className="divide-y divide-slate-100">
        {participants.map((participant) => (
          <ParticipantRow key={participant.user.id} participant={participant} />
        ))}
      </ul>
    )
  }

  // Portal: o painel da aba anima com transform, que prenderia o `fixed`
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-md animate-fade-slide-in flex-col rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="min-w-0">
            <h3 id="participants-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              Presenças confirmadas
            </h3>
            <p className="truncate text-sm text-slate-500">{event.title}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{getAttendanceSummary(event).label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <FaXmark size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-4">{content}</div>
      </div>
    </div>,
    document.body
  )
}

export default EventParticipantsModal
