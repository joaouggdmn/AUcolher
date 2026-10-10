import AnimalStatusChart from '../../components/dashboard/charts/AnimalStatusChart'
import BarList from '../../components/dashboard/charts/BarList'
import ChartCard from '../../components/dashboard/charts/ChartCard'
import ColumnChart from '../../components/dashboard/charts/ColumnChart'
import { adoptionFunnel, CHART_MONTHS, monthlyDonationColumns } from '../../utils/panelCharts'
import AttentionList from '../overview/AttentionList'
import OverviewTiles from '../overview/OverviewTiles'
import RecentActivity from '../overview/RecentActivity'
import PanelPage from '../PanelPage'
import { useOngPanel } from '../useOngPanel'

function ChartMessage({ children }) {
  return <p className="py-6 text-center text-sm text-slate-400">{children}</p>
}

function OverviewPage() {
  const { dashboard } = useOngPanel()
  const { animals, requests, donations, events, campaigns, stats, timeline, queries } = dashboard

  return (
    <PanelPage
      title="Visão geral"
      description="Como a ONG está hoje, o que pede sua atenção e o que aconteceu por último."
      framed={false}
    >
      <div className="flex flex-col gap-6">
        <OverviewTiles
          stats={stats}
          loading={{
            animals: queries.animals.isLoading,
            events: queries.events.isLoading,
            campaigns: queries.campaigns.isLoading,
            donations: queries.donations.isLoading,
          }}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr]">
          <AttentionList stats={stats} events={events} campaigns={campaigns} />
          <ChartCard title="Recebido por mês" subtitle={`Doações dos últimos ${CHART_MONTHS} meses, em reais`}>
            {queries.donations.isLoading ? (
              <ChartMessage>Carregando...</ChartMessage>
            ) : (
              <ColumnChart columns={monthlyDonationColumns(donations)} colorClass="bg-amber-600" />
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {animals.length > 0 ? (
            <AnimalStatusChart animals={animals} />
          ) : (
            <ChartCard title="Situação dos anúncios">
              <ChartMessage>
                {queries.animals.isLoading
                  ? 'Carregando...'
                  : queries.animals.error
                    ? 'Não foi possível carregar os animais.'
                    : 'Nenhum animal cadastrado ainda.'}
              </ChartMessage>
            </ChartCard>
          )}

          <ChartCard title="Do pedido à adoção" subtitle="Quantos pedidos chegaram a cada etapa">
            {requests.length > 0 ? (
              <BarList items={adoptionFunnel(requests)} />
            ) : (
              <ChartMessage>Nenhum pedido de adoção ainda.</ChartMessage>
            )}
          </ChartCard>
        </div>

        <RecentActivity timeline={timeline} />
      </div>
    </PanelPage>
  )
}

export default OverviewPage
