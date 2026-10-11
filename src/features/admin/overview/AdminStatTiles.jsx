import {
  FaCalendarDays,
  FaHandHoldingDollar,
  FaHandHoldingHeart,
  FaHandshake,
  FaHouseChimney,
  FaPaw,
  FaUserPlus,
  FaUsers,
} from 'react-icons/fa6'
import StatTile from '../../../core/components/panel/StatTile'
import { formatCurrency } from '../../../core/utils/currency'
import { ADMIN_PATHS } from '../panel/adminPaths'

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

// Os números da plataforma; o clique leva para a seção correspondente
function AdminStatTiles({ stats }) {
  const { users, animals, adoptions, donations, campaigns, events } = stats
  // A série termina no mês atual: o último ponto é este mês, o anterior é o passado
  const newThisMonth = users.newByMonth.at(-1)?.value ?? 0
  const newLastMonth = users.newByMonth.at(-2)?.value ?? 0
  const adoptionsInProgress = adoptions.funnel.accepted - adoptions.funnel.concluded

  const tiles = [
    {
      key: 'contas',
      to: ADMIN_PATHS.users,
      icon: FaUsers,
      value: users.total,
      label: plural(users.total, 'conta', 'contas'),
      caption: `${users.persons} ${plural(users.persons, 'pessoa', 'pessoas')} · ${users.ngos} ${plural(users.ngos, 'ONG', 'ONGs')}`,
    },
    {
      key: 'novas',
      to: ADMIN_PATHS.users,
      icon: FaUserPlus,
      value: newThisMonth,
      label: plural(newThisMonth, 'conta nova neste mês', 'contas novas neste mês'),
      caption: `${newLastMonth} no mês passado`,
    },
    {
      key: 'animais',
      to: ADMIN_PATHS.animals,
      icon: FaPaw,
      value: animals.available,
      label: plural(animals.available, 'animal disponível', 'animais disponíveis'),
      caption: `${animals.total} ${plural(animals.total, 'anúncio', 'anúncios')} · ${animals.inProgress} em processo`,
    },
    {
      key: 'andamento',
      icon: FaHandshake,
      value: adoptionsInProgress,
      label: plural(adoptionsInProgress, 'adoção em andamento', 'adoções em andamento'),
      caption: 'Pedidos aceitos, a caminho da entrega',
    },
    {
      key: 'adocoes',
      to: ADMIN_PATHS.animals,
      icon: FaHouseChimney,
      value: adoptions.funnel.concluded,
      label: plural(adoptions.funnel.concluded, 'adoção concluída', 'adoções concluídas'),
      caption: `De ${adoptions.funnel.received} ${plural(adoptions.funnel.received, 'pedido recebido', 'pedidos recebidos')}`,
    },
    {
      key: 'arrecadado',
      to: ADMIN_PATHS.campaigns,
      icon: FaHandHoldingDollar,
      value: formatCurrency(donations.totalRaised),
      label: 'arrecadados em campanhas',
      caption: `${donations.approvedCount} ${plural(donations.approvedCount, 'doação aprovada', 'doações aprovadas')}`,
    },
    {
      key: 'campanhas',
      to: ADMIN_PATHS.campaigns,
      icon: FaHandHoldingHeart,
      value: campaigns.active,
      label: plural(campaigns.active, 'campanha ativa', 'campanhas ativas'),
      caption: `${campaigns.closed} ${plural(campaigns.closed, 'encerrada', 'encerradas')}`,
    },
    {
      key: 'eventos',
      to: ADMIN_PATHS.events,
      icon: FaCalendarDays,
      value: events.upcoming,
      label: plural(events.upcoming, 'evento agendado', 'eventos agendados'),
      caption: `${events.past} já ${plural(events.past, 'aconteceu', 'aconteceram')}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
      {tiles.map(({ key, ...tile }) => (
        <StatTile key={key} {...tile} />
      ))}
    </div>
  )
}

export default AdminStatTiles
