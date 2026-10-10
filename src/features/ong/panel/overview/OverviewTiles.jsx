import { Link } from 'react-router-dom'
import { FaCalendarDays, FaHandHoldingDollar, FaHandHoldingHeart, FaHouseChimney, FaInbox, FaPaw } from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'
import { PANEL_PATHS } from '../panelPaths'

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

function formatDayMonth(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function OverviewTile({ to, icon: Icon, value, label, caption }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={15} />
      </span>
      <span className="min-w-0 max-w-full">
        <span className="block text-2xl font-black tracking-tight text-emerald-950">{value}</span>
        <span className="block text-sm font-bold leading-snug text-emerald-950">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-500">{caption}</span>
      </span>
    </Link>
  )
}

// Os números de cada área; o clique leva para a seção
function OverviewTiles({ stats, loading }) {
  const tiles = [
    {
      key: 'animais',
      to: PANEL_PATHS.animals,
      icon: FaPaw,
      value: loading.animals ? '—' : stats.animalsAvailable,
      label: plural(stats.animalsAvailable, 'animal disponível', 'animais disponíveis'),
      caption: loading.animals
        ? 'Carregando...'
        : `${stats.animalsTotal} ${plural(stats.animalsTotal, 'cadastrado', 'cadastrados')} · ${stats.animalsInProgress} em processo`,
    },
    {
      key: 'pedidos',
      to: PANEL_PATHS.requests,
      icon: FaInbox,
      value: stats.requestsReceived,
      label: plural(stats.requestsReceived, 'pedido de adoção', 'pedidos de adoção'),
      caption: `${stats.pendingRequests} aguardando resposta`,
    },
    {
      key: 'adocoes',
      to: PANEL_PATHS.requests,
      icon: FaHouseChimney,
      value: stats.adoptionsConcluded,
      label: plural(stats.adoptionsConcluded, 'adoção concluída', 'adoções concluídas'),
      caption: `${stats.adoptionsInProgress} em andamento`,
    },
    {
      key: 'eventos',
      to: PANEL_PATHS.events,
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
      to: PANEL_PATHS.campaigns,
      icon: FaHandHoldingHeart,
      value: loading.campaigns ? '—' : stats.activeCampaigns,
      label: plural(stats.activeCampaigns, 'campanha ativa', 'campanhas ativas'),
      caption: loading.campaigns ? 'Carregando...' : `${formatCurrency(stats.activeRaised)} arrecadados`,
    },
    {
      key: 'doacoes',
      to: PANEL_PATHS.donations,
      icon: FaHandHoldingDollar,
      value: loading.donations ? '—' : formatCurrency(stats.totalReceived),
      label: 'recebidos em doações',
      caption: loading.donations
        ? 'Carregando...'
        : `${stats.donations} ${plural(stats.donations, 'doação confirmada', 'doações confirmadas')}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map(({ key, ...tile }) => (
        <OverviewTile key={key} {...tile} />
      ))}
    </div>
  )
}

export default OverviewTiles
