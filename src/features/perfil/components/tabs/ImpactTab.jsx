import { formatCurrency } from '../../../../core/utils/currency'
import { mockUserImpact, IMPACT_TYPE_META } from '../../data/mockUserImpact'

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function ImpactTab() {
  if (mockUserImpact.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">Seu histórico de impacto aparecerá aqui.</p>
  }

  const totalDonated = mockUserImpact
    .filter((item) => item.type === 'DOACAO')
    .reduce((sum, item) => sum + item.amount, 0)
  const eventsCount = mockUserImpact.filter((item) => item.type === 'EVENTO').length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-emerald-50/70 p-5 text-center">
          <p className="font-serif text-2xl font-black text-emerald-900">{formatCurrency(totalDonated)}</p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">Total doado</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5 text-center">
          <p className="font-serif text-2xl font-black text-amber-700">{eventsCount}</p>
          <p className="mt-1 text-xs font-semibold text-amber-700">Eventos participados</p>
        </div>
      </div>

      <div className="relative flex flex-col gap-6 pl-2">
        <div className="pointer-events-none absolute bottom-2 left-[19px] top-2 w-0 border-l-2 border-dashed border-emerald-200" />

        {mockUserImpact.map((item) => {
          const meta = IMPACT_TYPE_META[item.type]
          const Icon = meta.icon
          return (
            <div key={item.id} className="relative flex items-start gap-4">
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md ${meta.className}`}>
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
    </div>
  )
}

export default ImpactTab