import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaCircleCheck, FaComments, FaHourglassHalf, FaInbox } from 'react-icons/fa6'
import { PANEL_PATHS } from '../panelPaths'

const SOON_DAYS = 7

const TONES = {
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
}

// 'YYYY-MM-DD' → dias a partir de hoje (0 = hoje), sem depender do fuso
function daysUntil(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const today = new Date()
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000)
}

function relativeDay(days) {
  if (days === 0) return 'hoje'
  if (days === 1) return 'amanhã'
  return `em ${days} dias`
}

// O que pede uma ação da ONG agora; o clique leva para a seção
function AttentionList({ stats, events, campaigns }) {
  const soonEvents = events.upcoming
    .map((event) => ({ event, days: daysUntil(event.date) }))
    .filter(({ days }) => days <= SOON_DAYS)
  const endingCampaigns = campaigns.active
    .filter((campaign) => campaign.deadline)
    .map((campaign) => ({ campaign, days: daysUntil(campaign.deadline) }))
    .filter(({ days }) => days >= 0 && days <= SOON_DAYS)

  const items = [
    stats.pendingRequests > 0 && {
      key: 'pedidos',
      to: PANEL_PATHS.requests,
      icon: FaInbox,
      tone: 'rose',
      text:
        stats.pendingRequests === 1
          ? '1 pedido de adoção espera sua resposta'
          : `${stats.pendingRequests} pedidos de adoção esperam sua resposta`,
    },
    stats.unreadMessages > 0 && {
      key: 'conversas',
      to: PANEL_PATHS.chats,
      icon: FaComments,
      tone: 'rose',
      text: stats.unreadMessages === 1 ? '1 mensagem não lida' : `${stats.unreadMessages} mensagens não lidas`,
    },
    ...soonEvents.map(({ event, days }) => ({
      key: `evento-${event.id}`,
      to: PANEL_PATHS.events,
      icon: FaCalendarDays,
      tone: 'sky',
      text: `${event.title} acontece ${relativeDay(days)}`,
    })),
    ...endingCampaigns.map(({ campaign, days }) => ({
      key: `campanha-${campaign.id}`,
      to: PANEL_PATHS.campaigns,
      icon: FaHourglassHalf,
      tone: 'amber',
      text: `A campanha ${campaign.title} termina ${relativeDay(days)}`,
    })),
  ].filter(Boolean)

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-extrabold tracking-tight text-emerald-950">Precisa da sua atenção</h2>

      {items.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <FaCircleCheck size={14} className="text-emerald-600" />
          Nada pendente por aqui.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-slate-100">
          {items.map(({ key, to, icon: Icon, tone, text }) => (
            <li key={key}>
              <Link to={to} className="group flex items-center gap-3 py-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700 group-hover:text-emerald-800">{text}</span>
                <FaArrowRight size={11} className="shrink-0 text-slate-300 transition-colors duration-200 group-hover:text-emerald-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AttentionList
