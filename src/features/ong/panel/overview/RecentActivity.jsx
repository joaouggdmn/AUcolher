import {
  FaCalendarDays,
  FaClockRotateLeft,
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

// Os últimos acontecimentos de todas as áreas, do mais novo para o mais antigo
function RecentActivity({ timeline }) {
  const recent = timeline.slice(0, RECENT_LIMIT).map((item) => {
    const meta = TIMELINE_META[item.type]
    return { id: item.id, date: item.date, icon: meta.icon, iconClassName: meta.className, ...meta.describe(item) }
  })

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-sm font-extrabold tracking-tight text-emerald-950">Atividade recente</h2>
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
  )
}

export default RecentActivity
