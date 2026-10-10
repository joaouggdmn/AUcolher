import { FaHandHoldingHeart, FaHouseChimney, FaPaw } from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'
import Timeline from '../../../../core/components/ui/Timeline'
import ActivityEmptyState from './ActivityEmptyState'

const TIMELINE_META = {
  DOACAO: { icon: FaHandHoldingHeart, className: 'bg-amber-400 text-emerald-950' },
  ADOCAO_RECEBIDA: { icon: FaHouseChimney, className: 'bg-emerald-700 text-white' },
  ADOCAO_DOADA: { icon: FaPaw, className: 'bg-emerald-700 text-white' },
}

function ImpactTile({ value, label, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50/70 text-emerald-900',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className={`rounded-2xl p-5 text-center ${tones[tone]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-semibold opacity-80">{label}</p>
    </div>
  )
}

function ImpactPanel({ impact, isOng }) {
  const tiles = [
    { key: 'adocoes', value: impact.adoptionsCount, label: isOng ? 'Adoções realizadas' : 'Adoções concluídas' },
    { key: 'andamento', value: impact.inProgressCount, label: 'Adoções em andamento' },
    // ONG também doa para campanhas de outras ONGs
    { key: 'doado', value: formatCurrency(impact.totalDonated), label: 'Total doado', tone: 'amber' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className={`grid grid-cols-2 gap-4 ${tiles.length === 3 ? 'sm:grid-cols-3' : ''}`}>
        {tiles.map(({ key, ...tile }) => (
          <ImpactTile key={key} {...tile} />
        ))}
      </div>

      {impact.timeline.length === 0 ? (
        <ActivityEmptyState
          icon={FaHandHoldingHeart}
          title="Seu histórico de impacto aparecerá aqui."
          description={
            isOng
              ? 'Cada adoção concluída pela instituição e cada doação para outras campanhas entram nesta linha do tempo.'
              : 'Adoções concluídas e doações para campanhas entram nesta linha do tempo.'
          }
        />
      ) : (
        <Timeline
          items={impact.timeline.map((item) => ({
            ...item,
            icon: TIMELINE_META[item.type].icon,
            iconClassName: TIMELINE_META[item.type].className,
            highlight: item.type === 'DOACAO' ? formatCurrency(item.amount) : null,
          }))}
        />
      )}
    </div>
  )
}

export default ImpactPanel
