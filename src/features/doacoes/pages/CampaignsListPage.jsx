import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFilter, FaHandHoldingHeart } from 'react-icons/fa6'
import HeroSosBanner from '../components/HeroSosBanner'
import CampaignsControlBar from '../components/CampaignsControlBar'
import CampaignsGrid from '../components/CampaignsGrid'
import DonationModal from '../components/DonationModal'
import CampaignsFiltersSidebar from '../components/filters/CampaignsFiltersSidebar'
import CampaignsFiltersDrawer from '../components/filters/CampaignsFiltersDrawer'
import { matchesStatusFilter } from '../components/filters/filterOptions'
import { useCampaigns } from '../hooks/useCampanhas'
import { pickSosCampaign } from '../utils/campaignDisplay'
import { getErrorMessage } from '../../../core/utils/apiError'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import CreateEntityCta from '../../../core/components/ui/CreateEntityCta'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import InfoToast from '../../../core/components/ui/InfoToast'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'

const INITIAL_FILTERS = { categorias: [], status: [] }
const PAGE_SIZE = 12
const NO_CAMPAIGNS = []

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function CampaignsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: campaigns = NO_CAMPAIGNS, isLoading, isError, error, refetch } = useCampaigns()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [ongWarning, setOngWarning] = useState(null)

  // A API devolve só campanhas ativas, da mais nova para a mais antiga
  const sosCampaign = useMemo(() => pickSosCampaign(campaigns), [campaigns])

  // Toda mudança de busca/filtro volta para a primeira página
  const updateFilters = (updater) => {
    setFilters(updater)
    setVisibleCount(PAGE_SIZE)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setVisibleCount(PAGE_SIZE)
  }

  const handleToggleCategoria = (value) => {
    updateFilters((prev) => ({ ...prev, categorias: toggleArrayValue(prev.categorias, value) }))
  }

  const handleToggleStatus = (value) => {
    updateFilters((prev) => ({ ...prev, status: toggleArrayValue(prev.status, value) }))
  }

  const handleClearFilters = () => {
    setSearch('')
    updateFilters(INITIAL_FILTERS)
  }

  const hasActiveFilters = search !== '' || filters.categorias.length > 0 || filters.status.length > 0
  const activeFiltersCount = filters.categorias.length + filters.status.length

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        campaign.title.toLowerCase().includes(term) ||
        campaign.ong.name.toLowerCase().includes(term)

      const matchesCategoria = filters.categorias.length === 0 || filters.categorias.includes(campaign.category)
      const matchesStatus =
        filters.status.length === 0 || filters.status.some((status) => matchesStatusFilter(campaign, status))

      return matchesSearch && matchesCategoria && matchesStatus
    })
  }, [campaigns, search, filters])

  const visibleCampaigns = filteredCampaigns.slice(0, visibleCount)
  const hasMore = visibleCount < filteredCampaigns.length

  const filterPanelProps = {
    filters,
    onToggleCategoria: handleToggleCategoria,
    onToggleStatus: handleToggleStatus,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const handleNeedsOng = () => {
    setOngWarning('Apenas contas de ONG podem criar campanhas de arrecadação.')
    setTimeout(() => setOngWarning(null), 3500)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      {sosCampaign && (
        <div className="mb-10">
          <HeroSosBanner campaign={sosCampaign} onDonate={setSelectedCampaign} />
        </div>
      )}

      <header className="mb-6 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {isLoading
            ? 'Carregando campanhas...'
            : `${filteredCampaigns.length} ${filteredCampaigns.length === 1 ? 'campanha encontrada' : 'campanhas encontradas'}`}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Campanhas de arrecadação
        </h1>
        <p className="max-w-xl text-slate-600">
          Cada campanha é conduzida por uma ONG verificada. Escolha uma causa e ajude com o valor que puder.
        </p>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        <CampaignsFiltersSidebar {...filterPanelProps} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-3">
            <CampaignsControlBar search={search} onSearchChange={handleSearchChange} />

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex h-12 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-emerald-900 shadow-sm transition-all duration-300 hover:border-emerald-300 lg:hidden"
            >
              <FaFilter size={14} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-emerald-950">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {isError ? (
            <LoadErrorState
              title="Não foi possível carregar as campanhas"
              message={getErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : (
            <CampaignsGrid
              campaigns={visibleCampaigns}
              isLoading={isLoading}
              hasActiveFilters={hasActiveFilters}
              onDonate={setSelectedCampaign}
              onClearFilters={handleClearFilters}
            />
          )}

          {hasMore && (
            <ShowMoreButton
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              remainingCount={filteredCampaigns.length - visibleCount}
            />
          )}
        </div>
      </div>

      <CreateEntityCta
        icon={FaHandHoldingHeart}
        title="Sua ONG quer arrecadar recursos?"
        description="Crie campanhas de doação para tratamentos, alimentação ou estrutura do abrigo, com transparência total para os doadores."
        buttonLabel="Criar campanha"
        targetPath="/campanhas/criar"
        requireOng
        onNeedsLogin={() => setIsAuthModalOpen(true)}
        onNeedsOng={handleNeedsOng}
      />

      <CampaignsFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredCampaigns.length}
        {...filterPanelProps}
      />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para criar uma campanha, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}

      <InfoToast message={ongWarning} />

      {selectedCampaign && (
        <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}

export default CampaignsListPage
