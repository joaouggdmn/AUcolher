import { useState } from 'react'
import { FaHandHoldingDollar, FaHandHoldingHeart, FaLock, FaReceipt } from 'react-icons/fa6'
import BarList from '../../../core/components/charts/BarList'
import ChartCard from '../../../core/components/charts/ChartCard'
import PanelPage from '../../../core/components/panel/PanelPage'
import StatTile from '../../../core/components/panel/StatTile'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import Spinner from '../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import { matchesSearch } from '../../../core/utils/search'
import SearchBar from '../../animais/components/SearchBar'
import { CATEGORIA_OPTIONS } from '../../doacoes/components/filters/filterOptions'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'
import AdminCampaignRow from '../components/AdminCampaignRow'
import { useAdminCampaigns } from '../hooks/useAdmin'
import { CAMPAIGN_STATUS_META, campaignStatus } from '../utils/listStatus'

const PAGE_SIZE = 20
const NO_CAMPAIGNS = []

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

function sumBy(items, valueOf) {
  return items.reduce((total, item) => total + valueOf(item), 0)
}

function AdminCampaignsPage() {
  const { data: campaigns = NO_CAMPAIGNS, isLoading, error, refetch } = useAdminCampaigns()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Filtro novo, lista do começo
  function withReset(setter) {
    return (value) => {
      setter(value)
      setVisibleCount(PAGE_SIZE)
    }
  }

  let content
  if (isLoading) {
    content = <Spinner />
  } else if (error) {
    content = (
      <LoadErrorState title="Não foi possível carregar as campanhas" message={getErrorMessage(error)} onRetry={refetch} />
    )
  } else if (campaigns.length === 0) {
    content = (
      <ActivityEmptyState
        icon={FaHandHoldingHeart}
        title="Nenhuma campanha ainda."
        description="As campanhas de doação que as ONGs abrirem aparecem aqui, com o quanto já arrecadaram."
      />
    )
  } else {
    const countByStatus = (status) => campaigns.filter((campaign) => campaignStatus(campaign) === status).length
    const totalRaised = sumBy(campaigns, (campaign) => campaign.raisedAmount)
    const totalDonations = sumBy(campaigns, (campaign) => campaign.donationsCount)
    const activeCount = countByStatus('ACTIVE')
    const closedCount = countByStatus('CLOSED')

    // Arrecadado por categoria: inclui encerradas e excluídas (o dinheiro entrou)
    const byCategory = CATEGORIA_OPTIONS.map(({ value, label }) => {
      const raised = sumBy(
        campaigns.filter((campaign) => campaign.category === value),
        (campaign) => campaign.raisedAmount
      )
      return { key: value, label, value: raised, valueText: formatCurrency(raised), colorClass: 'bg-amber-600' }
    })

    const statusOptions = [
      { value: '', label: `Todas (${campaigns.length})` },
      ...Object.entries(CAMPAIGN_STATUS_META)
        .map(([status, meta]) => ({ value: status, count: countByStatus(status), label: meta.filterLabel }))
        .filter((option) => option.count > 0)
        .map(({ value, count, label }) => ({ value, label: `${label} (${count})` })),
    ]

    const filtered = campaigns
      .filter((campaign) => !statusFilter || campaignStatus(campaign) === statusFilter)
      .filter((campaign) => matchesSearch(search, campaign.title, campaign.ong.name))
    const visible = filtered.slice(0, visibleCount)

    content = (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon={FaHandHoldingDollar}
              value={formatCurrency(totalRaised)}
              label="arrecadados no total"
              caption="Em todas as campanhas"
            />
            <StatTile
              icon={FaReceipt}
              value={totalDonations}
              label={plural(totalDonations, 'doação aprovada', 'doações aprovadas')}
              caption={totalDonations > 0 ? `Média de ${formatCurrency(Math.round(totalRaised / totalDonations))}` : 'Nenhuma ainda'}
            />
            <StatTile
              icon={FaHandHoldingHeart}
              value={activeCount}
              label={plural(activeCount, 'campanha ativa', 'campanhas ativas')}
              caption="Recebendo doações agora"
            />
            <StatTile
              icon={FaLock}
              value={closedCount}
              label={plural(closedCount, 'encerrada', 'encerradas')}
              caption="Pela ONG ou pelo prazo"
            />
          </div>
          <ChartCard title="Arrecadado por categoria" subtitle="Todas as campanhas, em reais">
            <BarList items={byCategory} />
          </ChartCard>
        </div>

        <div className="flex flex-col gap-4">
          <SearchBar value={search} onChange={withReset(setSearch)} placeholder="Buscar pelo título ou pela ONG..." />
          <PillToggleGroup options={statusOptions} value={statusFilter} onChange={withReset(setStatusFilter)} />

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Nenhuma campanha encontrada com esses filtros.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {visible.map((campaign) => (
                  <AdminCampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </ul>
              {visibleCount < filtered.length && (
                <ShowMoreButton
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  remainingCount={filtered.length - visibleCount}
                />
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <PanelPage
      title="Campanhas"
      description="Campanhas de doação de todas as ONGs. As excluídas pela ONG continuam aqui porque as doações delas contam no total."
    >
      {content}
    </PanelPage>
  )
}

export default AdminCampaignsPage
