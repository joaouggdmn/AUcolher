import { Link } from 'react-router-dom'
import { FaBan, FaComments, FaPaw } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { animalDisplayName } from '../utils/requestAnimal'
import { RETURN_STATUSES, SENT_STATUS_META, TONE_CLASSES, sentStatusDescription } from '../utils/requestStatus'
import ReturnInfo from './ReturnInfo'

const CHAT_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED', ...RETURN_STATUSES]
const CANCELLABLE_STATUSES = ['PENDING', 'ACCEPTED', 'AWAITING_DELIVERY']

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Um pedido enviado, do ponto de vista de quem pediu: em que etapa está, o
// motivo quando ele terminou sem adoção, o chat e a desistência
function SentRequestCard({ request, onGoToChat, onCancel }) {
  const { animal, status } = request
  const meta = SENT_STATUS_META[status]
  const StatusIcon = meta.icon
  const animalName = animalDisplayName(animal)
  const ownerName = animal.organizationName ?? animal.ownerName
  const ownerPath = animal.listingType === 'NGO' ? `/ong/${request.ownerId}` : `/perfil/publico/${request.ownerId}`

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/5">
      <Link
        to={`/animais/${animal.id}`}
        className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-3 transition-colors duration-300 hover:bg-emerald-50"
      >
        {animal.photoUrl ? (
          <img src={animal.photoUrl} alt={animalName} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
            <FaPaw size={16} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Seu pedido para</p>
          <p className="truncate text-sm font-bold text-emerald-950">{animalName}</p>
        </div>
        {typeof request.matchScore === 'number' && (
          <span
            title="Compatibilidade calculada pelo AUmatch"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm"
          >
            <LuSparkles size={12} className="text-amber-300" />
            {request.matchScore}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-xs text-slate-500">
          Anunciado por{' '}
          <Link to={ownerPath} className="font-semibold text-emerald-700 hover:underline">
            {ownerName}
          </Link>{' '}
          · enviado em {formatDate(request.createdAt)}
        </p>

        {RETURN_STATUSES.includes(status) ? (
          <ReturnInfo request={request} viewer="adopter" />
        ) : (
          <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 ${TONE_CLASSES[meta.tone]}`}>
            <StatusIcon size={13} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-extrabold">{meta.label}</p>
              <p className="text-xs font-medium opacity-90">{sentStatusDescription(request, animalName)}</p>
            </div>
          </div>
        )}

        {(CHAT_STATUSES.includes(status) || CANCELLABLE_STATUSES.includes(status)) && (
          <div className="mt-auto flex flex-col gap-2 pt-1">
            {CHAT_STATUSES.includes(status) && (
              <button
                type="button"
                onClick={() => onGoToChat(request.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 py-2.5 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-50"
              >
                <FaComments size={13} />
                {status === 'AWAITING_DELIVERY' ? 'Confirmar chegada no chat' : 'Ir para o chat'}
              </button>
            )}
            {CANCELLABLE_STATUSES.includes(status) && (
              <button
                type="button"
                onClick={() => onCancel(request)}
                className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-400 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-600"
              >
                <FaBan size={11} />
                Cancelar pedido
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SentRequestCard
