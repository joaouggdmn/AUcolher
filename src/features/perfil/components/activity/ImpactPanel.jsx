import { FaHandHoldingHeart, FaHouseChimney, FaPaw } from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'
import ActivityEmptyState from './ActivityEmptyState'

const TIMELINE_META = {
  DOACAO: { icon: FaHandHoldingHeart, className: 'bg-amber-400 text-emerald-950' },
  ADOCAO_RECEBIDA: { icon: FaHouseChimney, className: 'bg-emerald-700 text-white' },
  ADOCAO_DOADA: { icon: FaPaw, className: 'bg-emerald-700 text-white' },
}

function formatDate(date) {
  // Datas do mock vêm como 'YYYY-MM-DD'; as de adoção, como ISO completo
  const parsed = date.length === 10 ? new Date(`${date}T00:00:00`) : new Date(date)
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
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
    ...(isOng ? [] : [{ key: 'doado', value: formatCurrency(impact.totalDonated), label: 'Total doado', tone: 'amber' }]),
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
              ? 'Cada adoção concluída pela instituição entra nesta linha do tempo.'
              : 'Adoções concluídas e doações para campanhas entram nesta linha do tempo.'
          }
        />
      ) : (
        <div className="relative flex flex-col gap-6 pl-2">
          <div className="pointer-events-none absolute bottom-2 left-[19px] top-2 w-0 border-l-2 border-dashed border-emerald-200" />

          {impact.timeline.map((item) => {
            const meta = TIMELINE_META[item.type]
            const Icon = meta.icon
            return (
              <div key={item.id} className="relative flex items-start gap-4">
                <span
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md ${meta.className}`}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-sm font-bold text-emerald-950">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>{formatDate(item.date)}</span>
                    {item.type === 'DOACAO' && (
                      <span className="font-bold text-amber-600">{formatCurrency(item.amount)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImpactPanel
