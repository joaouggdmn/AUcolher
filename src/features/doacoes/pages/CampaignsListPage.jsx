import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFilter, FaHandHoldingHeart } from 'react-icons/fa6'
import HeroSosBanner from '../components/HeroSosBanner'
import CampaignsControlBar from '../components/CampaignsControlBar'
import CampaignsGrid from '../components/CampaignsGrid'
import DonationModal from '../components/DonationModal'
import CampaignsFiltersSidebar from '../components/filters/CampaignsFiltersSidebar'
import CampaignsFiltersDrawer from '../components/filters/CampaignsFiltersDrawer'
import { mockCampanhas } from '../data/mockCampanhas'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import CreateEntityCta from '../../../core/components/ui/CreateEntityCta'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import InfoToast from '../../../core/components/ui/InfoToast'

const INITIAL_FILTERS = { categorias: [], status: [] }
const PAGE_SIZE = 12

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function getPercentage(raised, goal) {
  return Math.min(100, Math.round((raised / goal) * 100))
}

function CampaignsListPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [ongWarning, setOngWarning] = useState(null)

  const campaigns = mockCampanhas
  const emergencyCampaign = useMemo(() => campaigns.find((c) => c.isEmergency) || campaigns[0], [campaigns])

  const handleToggleCategoria = (value) => {
    setFilters((prev) => ({ ...prev, categorias: toggleArrayValue(prev.categorias, value) }))
  }

  const handleToggleStatus = (value) => {
    setFilters((prev) => ({ ...prev, status: toggleArrayValue(prev.status, value) }))
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
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

      const percentage = getPercentage(campaign.raisedAmount, campaign.goalAmount)
      const matchesStatus =
        filters.status.length === 0 ||
        filters.status.some((s) => (s === 'URGENTE' ? campaign.isUrgent : percentage >= 80))

      return matchesSearch && matchesCategoria && matchesStatus
    })
  }, [campaigns, search, filters])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filters])

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
      <div className="mb-10">
        <HeroSosBanner campaign={emergencyCampaign} onDonate={setSelectedCampaign} />
      </div>

      <header className="mb-6 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campanha encontrada' : 'campanhas encontradas'}
        </span>
        <h1 className="font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
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
            <CampaignsControlBar search={search} onSearchChange={setSearch} />

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

          <CampaignsGrid
            campaigns={visibleCampaigns}
            onDonate={setSelectedCampaign}
            onClearFilters={handleClearFilters}
          />

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