import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import { formatCurrency } from '../../../core/utils/currency'

function RankingList({ title, items }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {items.length > 0 ? (
        <BarList items={items} />
      ) : (
        <p className="text-sm text-slate-400">Ninguém por aqui ainda.</p>
      )}
    </div>
  )
}

// As ONGs que mais arrecadaram e as que mais concluíram adoções
function NgoRankingCard({ ranking }) {
  const byRaised = ranking.byRaised.map((ngo) => ({
    key: ngo.id,
    label: ngo.name,
    value: ngo.raised,
    valueText: formatCurrency(ngo.raised),
    colorClass: 'bg-amber-600',
  }))
  const byAdoptions = ranking.byAdoptions.map((ngo) => ({
    key: ngo.id,
    label: ngo.name,
    value: ngo.adoptions,
    colorClass: 'bg-emerald-700',
  }))

  return (
    <ChartCard title="ONGs em destaque" subtitle="As 5 que mais arrecadaram e as 5 que mais concluíram adoções">
      <RankingList title="Mais arrecadaram" items={byRaised} />
      <RankingList title="Mais adoções" items={byAdoptions} />
    </ChartCard>
  )
}

export default NgoRankingCard
