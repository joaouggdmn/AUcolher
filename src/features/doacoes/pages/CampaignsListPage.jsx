import { useMemo, useState } from 'react'
import { FaFilter } from 'react-icons/fa6'
import HeroSosBanner from '../components/HeroSosBanner'
import CampaignsControlBar from '../components/CampaignsControlBar'
import CampaignsGrid from '../components/CampaignsGrid'
import DonationModal from '../components/DonationModal'
import CampaignsFiltersSidebar from '../components/filters/CampaignsFiltersSidebar'
import CampaignsFiltersDrawer from '../components/filters/CampaignsFiltersDrawer'
import { mockCampanhas } from '../data/mockCampanhas'

const INITIAL_FILTERS = { categorias: [], status: [] }

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function getPercentage(raised, goal) {
  return Math.min(100, Math.round((raised / goal) * 100))
}

function CampaignsListPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // Estado do modal vive AQUI, não dentro do card — evita o card (que tem
  // `transform` no hover) virar containing block do modal `fixed`
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  // 🔴 Quando o backend estiver pronto: const { data: campaigns = [] } = useCampanhas({ search, ...filters })
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

      // "Quase batendo a meta" é calculado dinamicamente (>= 80%), não é um campo
      // manual no mock — assim o status nunca fica desatualizado se o valor mudar
      const percentage = getPercentage(campaign.raisedAmount, campaign.goalAmount)
      const matchesStatus =
        filters.status.length === 0 ||
        filters.status.some((s) => (s === 'URGENTE' ? campaign.isUrgent : percentage >= 80))

      return matchesSearch && matchesCategoria && matchesStatus
    })
  }, [campaigns, search, filters])

  const filterPanelProps = {
    filters,
    onToggleCategoria: handleToggleCategoria,
    onToggleStatus: handleToggleStatus,
    onClear: handleClearFilters,
    hasActiveFilters,
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
            campaigns={filteredCampaigns}
            onDonate={setSelectedCampaign}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      <CampaignsFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredCampaigns.length}
        {...filterPanelProps}
      />

      {selectedCampaign && (
        <DonationModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  )
}

export default CampaignsListPage