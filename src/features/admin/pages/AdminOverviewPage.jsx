import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import ColumnChart from '../../../core/components/charts/ColumnChart'
import StackedBar from '../../../core/components/charts/StackedBar'
import PanelPage from '../../../core/components/panel/PanelPage'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import {
  adoptionFunnelFromCounts,
  animalStatusSegmentsFromCounts,
  CHART_MONTHS,
  monthColumns,
  speciesBarsFromCounts,
} from '../../ong/utils/panelCharts'
import { useAdminStats } from '../hooks/useAdmin'
import AdminRecentActivity from '../overview/AdminRecentActivity'
import AdminStatTiles from '../overview/AdminStatTiles'
import NgoRankingCard from '../overview/NgoRankingCard'

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

function ChartMessage({ children }) {
  return <p className="py-6 text-center text-sm text-slate-400">{children}</p>
}

// Seis colunas zeradas não dizem nada: no lugar delas, uma frase
function MonthlyChart({ columns, colorClass, emptyMessage }) {
  if (columns.every((column) => column.value === 0)) return <ChartMessage>{emptyMessage}</ChartMessage>
  return <ColumnChart columns={columns} colorClass={colorClass} />
}

function AdminOverviewPage() {
  const { data: stats, isLoading, error, refetch } = useAdminStats()

  return (
    <PanelPage
      title="Visão geral"
      description="Como a plataforma está hoje: contas, animais, adoções, doações e eventos."
      framed={false}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <LoadErrorState message={getErrorMessage(error, 'Tente de novo em instantes.')} onRetry={refetch} />
      ) : (
        <OverviewContent stats={stats} />
      )}
    </PanelPage>
  )
}

function OverviewContent({ stats }) {
  const { users, animals, adoptions, donations } = stats

  const accountSegments = [
    { key: 'PERSON', label: 'Pessoas', value: users.persons, colorClass: 'bg-sky-600' },
    { key: 'NGO', label: 'ONGs', value: users.ngos, colorClass: 'bg-amber-600' },
  ]
  const statusSegments = animalStatusSegmentsFromCounts({
    AVAILABLE: animals.available,
    IN_PROGRESS: animals.inProgress,
    ADOPTED: animals.adopted,
  })

  return (
    <div className="flex flex-col gap-6">
      <AdminStatTiles stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Adoções concluídas por mês" subtitle={`Últimos ${CHART_MONTHS} meses, em toda a plataforma`}>
          <MonthlyChart
            columns={monthColumns(adoptions.concludedByMonth, {
              formatValue: (value) => `${value} ${plural(value, 'adoção', 'adoções')}`,
            })}
            colorClass="bg-emerald-700"
            emptyMessage={`Nenhuma adoção concluída nos últimos ${CHART_MONTHS} meses.`}
          />
        </ChartCard>

        <ChartCard title="Arrecadado por mês" subtitle={`Doações aprovadas nos últimos ${CHART_MONTHS} meses, em reais`}>
          <MonthlyChart
            columns={monthColumns(donations.raisedByMonth, { formatValue: formatCurrency, countLabel: ['doação', 'doações'] })}
            colorClass="bg-amber-600"
            emptyMessage={`Nenhuma doação aprovada nos últimos ${CHART_MONTHS} meses.`}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Novas contas por mês" subtitle={`Cadastros nos últimos ${CHART_MONTHS} meses`}>
          <MonthlyChart
            columns={monthColumns(users.newByMonth, {
              formatValue: (value) => `${value} ${plural(value, 'conta nova', 'contas novas')}`,
            })}
            colorClass="bg-sky-600"
            emptyMessage={`Nenhum cadastro nos últimos ${CHART_MONTHS} meses.`}
          />
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Todas as contas, por tipo</p>
            <StackedBar segments={accountSegments} />
          </div>
        </ChartCard>

        <ChartCard title="Situação dos animais" subtitle={`${animals.total} ${plural(animals.total, 'anúncio', 'anúncios')} na plataforma`}>
          {animals.total === 0 ? (
            <ChartMessage>Nenhum animal anunciado ainda.</ChartMessage>
          ) : (
            <>
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-emerald-950">{animals.available}</span>
                <span className="text-sm font-semibold text-slate-500">
                  {plural(animals.available, 'disponível para adoção', 'disponíveis para adoção')}
                </span>
              </p>
              <StackedBar segments={statusSegments} />
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Por espécie</p>
                <BarList items={speciesBarsFromCounts(animals.bySpecies)} />
              </div>
            </>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Do pedido à adoção" subtitle="Quantos pedidos chegaram a cada etapa, em toda a plataforma">
          {adoptions.funnel.received > 0 ? (
            <BarList items={adoptionFunnelFromCounts(adoptions.funnel)} />
          ) : (
            <ChartMessage>Nenhum pedido de adoção ainda.</ChartMessage>
          )}
        </ChartCard>

        <NgoRankingCard ranking={stats.ngoRanking} />
      </div>

      <AdminRecentActivity items={stats.recentActivity} />
    </div>
  )
}

export default AdminOverviewPage
