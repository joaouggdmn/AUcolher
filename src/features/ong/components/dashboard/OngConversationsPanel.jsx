import { Link } from 'react-router-dom'
import { FaComments, FaInbox } from 'react-icons/fa6'
import { toLocalIsoDate, todayLocalIso } from '../../../../core/utils/localDate'
import { REQUEST_STATUS_META } from '../../../adocao/utils/requestStatus'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'

// Hoje mostra a hora; antes disso, o dia
function formatMessageTime(timestamp) {
  const date = new Date(timestamp)
  if (toLocalIsoDate(date) === todayLocalIso()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function ContactAvatar({ name, photoUrl }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
      {photoUrl ? <img src={photoUrl} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
    </span>
  )
}

// Aba "Conversas": um chat por pedido aceito. O clique abre o chat já na conversa
function OngConversationsPanel({ conversations }) {
  if (conversations.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaComments}
        title="Nenhuma conversa ainda."
        description="O chat com o adotante abre quando você aceita um pedido de adoção."
        action={{ to: '/interesses-recebidos', label: 'Ver interesses recebidos', icon: FaInbox }}
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100">
      {conversations.map((conversation) => {
        const status = REQUEST_STATUS_META[conversation.status]
        const hasUnread = conversation.unread > 0

        return (
          <li key={conversation.id}>
            <Link
              to="/chat"
              state={{ requestId: conversation.requestId }}
              className="flex items-center gap-3 px-4 py-3 transition-colors duration-300 first:rounded-t-2xl last:rounded-b-2xl hover:bg-emerald-50/50"
            >
              <ContactAvatar name={conversation.name} photoUrl={conversation.photoUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="truncate text-sm font-bold text-emerald-950">{conversation.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${status.className}`}>{status.label}</span>
                </div>
                <p className={`truncate text-xs ${hasUnread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                  <span className="font-semibold text-emerald-700">{conversation.animalName}</span>
                  {' · '}
                  {conversation.lastMessageText ?? 'Nenhuma mensagem ainda'}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {conversation.lastMessageAt && (
                  <span className="text-[11px] text-slate-400">{formatMessageTime(conversation.lastMessageAt)}</span>
                )}
                {hasUnread && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white">
                    {conversation.unread > 9 ? '9+' : conversation.unread}
                    <span className="sr-only"> {conversation.unread === 1 ? 'mensagem não lida' : 'mensagens não lidas'}</span>
                  </span>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default OngConversationsPanel
