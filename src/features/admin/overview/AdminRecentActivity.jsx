import {
  FaCalendarDays,
  FaClockRotateLeft,
  FaHandHoldingHeart,
  FaHouseChimney,
  FaUserPlus,
} from 'react-icons/fa6'
import Timeline from '../../../core/components/ui/Timeline'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'

const ACTIVITY_META = {
  ACCOUNT_CREATED: {
    icon: FaUserPlus,
    className: 'bg-sky-100 text-sky-700',
    describe: ({ title, detail }) => ({
      title: `${title} entrou na plataforma`,
      subtitle: detail === 'ONG' ? 'Nova ONG' : 'Nova conta de pessoa',
    }),
  },
  ADOPTION_CONCLUDED: {
    icon: FaHouseChimney,
    className: 'bg-emerald-700 text-white',
    describe: ({ title, detail }) => ({
      title: `${title ?? 'Um animal'} ganhou um novo lar`,
      subtitle: detail ? `Adotado por ${detail}` : 'Adoção concluída',
    }),
  },
  CAMPAIGN_CREATED: {
    icon: FaHandHoldingHeart,
    className: 'bg-amber-100 text-amber-700',
    describe: ({ title, detail }) => ({ title: `Campanha criada: ${title}`, subtitle: detail }),
  },
  EVENT_CREATED: {
    icon: FaCalendarDays,
    className: 'bg-emerald-100 text-emerald-700',
    describe: ({ title, detail }) => ({ title: `Evento publicado: ${title}`, subtitle: detail }),
  },
}

// O que aconteceu por último na plataforma, do mais novo para o mais antigo
function AdminRecentActivity({ items }) {
  const timeline = items
    .filter((item) => ACTIVITY_META[item.type])
    .map((item) => {
      const meta = ACTIVITY_META[item.type]
      return {
        id: `${item.type}-${item.id}`,
        date: item.at,
        icon: meta.icon,
        iconClassName: meta.className,
        ...meta.describe(item),
      }
    })

  return (
    <section className="break-inside-avoid rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-sm font-extrabold tracking-tight text-emerald-950">Atividade recente</h2>
      {timeline.length === 0 ? (
        <ActivityEmptyState
          icon={FaClockRotateLeft}
          title="Nada por aqui ainda."
          description="Novas contas, adoções concluídas, campanhas e eventos aparecem nesta linha do tempo."
        />
      ) : (
        <Timeline items={timeline} />
      )}
    </section>
  )
}

export default AdminRecentActivity
