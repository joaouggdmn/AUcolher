import {
  FaCalendarDays,
  FaClockRotateLeft,
  FaComments,
  FaHandHoldingDollar,
  FaHandHoldingHeart,
  FaHouseChimney,
  FaInbox,
  FaPaw,
} from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'
import Timeline from '../../../../core/components/ui/Timeline'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'

const RECENT_LIMIT = 8

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

function formatDayMonth(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const TIMELINE_META = {
  ANIMAL: {
    icon: FaPaw,
    className: 'bg-emerald-100 text-emerald-700',
    describe: ({ animal }) => ({ title: `${animal.name} entrou para adoção`, subtitle: 'Animal cadastrado' }),
  },
  PEDIDO: {
    icon: FaInbox,
    className: 'bg-rose-100 text-rose-600',
    describe: ({ request }) => ({
      title: `${request.adopter.name} quer adotar ${request.animal.name ?? 'um animal'}`,
      subtitle: 'Novo pedido de adoção',
    }),
  },
  ADOCAO: {
    icon: FaHouseChimney,
    className: 'bg-emerald-700 text-white',
    describe: ({ request }) => ({
      title: `${request.animal.name ?? 'Um animal'} ganhou um novo lar`,
      subtitle: `Adotado por ${request.adopter.name}`,
    }),
  },
  DOACAO: {
    icon: FaHandHoldingDollar,
    className: 'bg-amber-400 text-emerald-950',
    describe: ({ donation }) => ({
      title: `${donation.donor.name} fez uma doação`,
      subtitle: donation.campaign.title,
      highlight: formatCurrency(donation.amount),
    }),
  },
  EVENTO: {
    icon: FaCalendarDays,
    className: 'bg-sky-100 text-sky-700',
    describe: ({ event }) => ({ title: `Evento publicado: ${event.title}`, subtitle: `Acontece em ${formatDayMonth(event.date)}` }),
  },
  CAMPANHA: {
    icon: FaHandHoldingHeart,
    className: 'bg-amber-100 text-amber-700',
    describe: ({ campaign }) => ({ title: `Campanha criada: ${campaign.title}`, subtitle: `Meta de ${formatCurrency(campaign.goalAmount)}` }),
  },
}

function OverviewTile({ icon: Icon, value, label, caption, needsAttention, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={15} />
        {needsAttention && (
          <span aria-hidden="true" className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500" />
        )}
      </span>
      <span className="min-w-0 max-w-full">
        <span className="block text-2xl font-black tracking-tight text-emerald-950">{value}</span>
        <span className="block text-sm font-bold leading-snug text-emerald-950">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{caption}</span>
      </span>
    </button>
  )
}

// Aba de entrada do painel: um card por área (o clique abre a aba dela) e o
// que aconteceu por último em todas elas
function OngOverviewPanel({ stats, timeline, loading, onSelect }) {
  const tiles = [
    {
      key: 'animais',
      icon: FaPaw,
      value: loading.animals ? '—' : stats.animalsAvailable,
      label: plural(stats.animalsAvailable, 'animal disponível', 'animais disponíveis'),
      caption: loading.animals
        ? 'Carregando...'
        : `${stats.animalsTotal} ${plural(stats.animalsTotal, 'cadastrado', 'cadastrados')} · ${stats.animalsInProgress} em processo`,
    },
    {
      key: 'adocoes',
      icon: FaInbox,
      value: stats.pendingRequests,
      label: plural(stats.pendingRequests, 'pedido aguardando resposta', 'pedidos aguardando resposta'),
      caption: `${stats.adoptionsInProgress} em andamento · ${stats.adoptionsConcluded} ${plural(stats.adoptionsConcluded, 'concluída', 'concluídas')}`,
      needsAttention: stats.pendingRequests > 0,
    },
    {
      key: 'conversas',
      icon: FaComments,
      value: stats.unreadMessages,
      label: plural(stats.unreadMessages, 'mensagem não lida', 'mensagens não lidas'),
      caption: `${stats.conversations} ${plural(stats.conversations, 'conversa', 'conversas')} com adotantes`,
      needsAttention: stats.unreadMessages > 0,
    },
    {
      key: 'eventos',
      icon: FaCalendarDays,
      value: loading.events ? '—' : stats.upcomingEvents,
      label: plural(stats.upcomingEvents, 'evento agendado', 'eventos agendados'),
      caption: loading.events
        ? 'Carregando...'
        : stats.nextEvent
          ? `Próximo: ${formatDayMonth(stats.nextEvent.date)}`
          : 'Nenhum evento marcado',
    },
    {
      key: 'campanhas',
      icon: FaHandHoldingHeart,
      value: loading.campaigns ? '—' : stats.activeCampaigns,
      label: plural(stats.activeCampaigns, 'campanha ativa', 'campanhas ativas'),
      caption: loading.campaigns ? 'Carregando...' : `${formatCurrency(stats.activeRaised)} arrecadados`,
    },
    {
      key: 'doacoes',
      icon: FaHandHoldingDollar,
      value: loading.donations ? '—' : formatCurrency(stats.totalReceived),
      label: 'recebidos em doações',
      caption: loading.donations
        ? 'Carregando...'
        : `${stats.donations} ${plural(stats.donations, 'doação confirmada', 'doações confirmadas')}`,
    },
  ]

  const recent = timeline.slice(0, RECENT_LIMIT).map((item) => {
    const meta = TIMELINE_META[item.type]
    return { id: item.id, date: item.date, icon: meta.icon, iconClassName: meta.className, ...meta.describe(item) }
  })

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ key, ...tile }) => (
          <OverviewTile key={key} {...tile} onClick={() => onSelect(key)} />
        ))}
      </div>

      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Atividade recente</h3>
        {recent.length === 0 ? (
          <ActivityEmptyState
            icon={FaClockRotateLeft}
            title="Nada por aqui ainda."
            description="Animais cadastrados, pedidos de adoção, doações, eventos e campanhas da ONG aparecem nesta linha do tempo."
          />
        ) : (
          <Timeline items={recent} />
        )}
      </section>
    </div>
  )
}

export default OngOverviewPanel
