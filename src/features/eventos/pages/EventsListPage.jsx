import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaCalendarDays, FaFilter } from 'react-icons/fa6'
import HeroEventBanner from '../components/HeroEventBanner'
import EventsControlBar from '../components/EventsControlBar'
import EventsGrid from '../components/EventsGrid'
import EventsFiltersSidebar from '../components/filters/EventsFiltersSidebar'
import EventsFiltersDrawer from '../components/filters/EventsFiltersDrawer'
import { buildCidadeOptions } from '../components/filters/filterOptions'
import { useEvents } from '../hooks/useEventos'
import { matchesPeriod } from '../utils/dateHelpers'
import { getErrorMessage } from '../../../core/utils/apiError'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import CreateEntityCta from '../../../core/components/ui/CreateEntityCta'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import InfoToast from '../../../core/components/ui/InfoToast'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'

const INITIAL_FILTERS = { categorias: [], periodo: '', cidade: '' }
const PAGE_SIZE = 12
const NO_EVENTS = []

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function EventsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: events = NO_EVENTS, isLoading, isError, error, refetch } = useEvents()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [viewMode, setViewMode] = useState('grid')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [ongWarning, setOngWarning] = useState(null)

  // A API devolve só eventos de hoje em diante, já em ordem de data
  const nextEvent = events[0] ?? null
  const cidadeOptions = useMemo(() => buildCidadeOptions(events), [events])

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

  const handlePeriodoChange = (periodo) => updateFilters((prev) => ({ ...prev, periodo }))
  const handleCidadeChange = (cidade) => updateFilters((prev) => ({ ...prev, cidade }))

  const handleClearFilters = () => {
    setSearch('')
    updateFilters(INITIAL_FILTERS)
  }

  const hasActiveFilters =
    search !== '' || filters.categorias.length > 0 || filters.periodo !== '' || filters.cidade !== ''

  const activeFiltersCount =
    filters.categorias.length + (filters.periodo !== '' ? 1 : 0) + (filters.cidade !== '' ? 1 : 0)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        event.title.toLowerCase().includes(term) ||
        event.location.city.toLowerCase().includes(term)

      const matchesCategoria = filters.categorias.length === 0 || filters.categorias.includes(event.category)
      const matchesCidade = filters.cidade === '' || event.location.city === filters.cidade
      const matchesPeriodo = matchesPeriod(event.date, filters.periodo)

      return matchesSearch && matchesCategoria && matchesCidade && matchesPeriodo
    })
  }, [events, search, filters])

  const visibleEvents = filteredEvents.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEvents.length

  const filterPanelProps = {
    filters,
    cidadeOptions,
    onToggleCategoria: handleToggleCategoria,
    onPeriodoChange: handlePeriodoChange,
    onCidadeChange: handleCidadeChange,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const handleNeedsOng = () => {
    setOngWarning('Apenas contas de ONG podem cadastrar eventos. Entre com uma conta institucional para continuar.')
    setTimeout(() => setOngWarning(null), 3500)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      {nextEvent && (
        <div className="mb-10">
          <HeroEventBanner event={nextEvent} />
        </div>
      )}

      <header className="mb-6 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {isLoading
            ? 'Carregando eventos...'
            : `${filteredEvents.length} ${filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Eventos e feiras de adoção
        </h1>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        <EventsFiltersSidebar {...filterPanelProps} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-3">
            <EventsControlBar
              search={search}
              onSearchChange={handleSearchChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

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
              title="Não foi possível carregar os eventos"
              message={getErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : (
            <EventsGrid
              events={visibleEvents}
              viewMode={viewMode}
              isLoading={isLoading}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}

          {hasMore && (
            <ShowMoreButton
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              remainingCount={filteredEvents.length - visibleCount}
            />
          )}
        </div>
      </div>

      <CreateEntityCta
        icon={FaCalendarDays}
        title="Sua ONG quer realizar um evento?"
        description="Divulgue feiras de adoção, mutirões e campanhas para milhares de adotantes cadastrados na plataforma."
        buttonLabel="Cadastrar meu evento"
        targetPath="/eventos/criar"
        requireOng
        onNeedsLogin={() => setIsAuthModalOpen(true)}
        onNeedsOng={handleNeedsOng}
      />

      <EventsFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredEvents.length}
        {...filterPanelProps}
      />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para cadastrar um evento, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}

      <InfoToast message={ongWarning} />
    </div>
  )
}

export default EventsListPage
