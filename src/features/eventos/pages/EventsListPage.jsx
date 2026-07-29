import { useMemo, useState } from 'react'
import { FaFilter } from 'react-icons/fa6'
import HeroEventBanner from '../components/HeroEventBanner'
import EventsControlBar from '../components/EventsControlBar'
import EventsGrid from '../components/EventsGrid'
import OngCtaSection from '../components/OngCtaSection'
import EventsFiltersSidebar from '../components/filters/EventsFiltersSidebar'
import EventsFiltersDrawer from '../components/filters/EventsFiltersDrawer'
import { mockEventos } from '../data/mockEventos'
import { matchesPeriod } from '../utils/dateHelpers'

const INITIAL_FILTERS = { categorias: [], periodo: '', cidade: '' }

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function EventsListPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [viewMode, setViewMode] = useState('grid')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 🔴 Quando o backend estiver pronto: const { data: events = [] } = useEventos({ search, ...filters })
  const events = mockEventos
  const featuredEvent = useMemo(() => events.find((e) => e.isFeatured) || events[0], [events])

  const handleToggleCategoria = (value) => {
    setFilters((prev) => ({ ...prev, categorias: toggleArrayValue(prev.categorias, value) }))
  }

  const handlePeriodoChange = (periodo) => setFilters((prev) => ({ ...prev, periodo }))
  const handleCidadeChange = (cidade) => setFilters((prev) => ({ ...prev, cidade }))

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
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

  const filterPanelProps = {
    filters,
    onToggleCategoria: handleToggleCategoria,
    onPeriodoChange: handlePeriodoChange,
    onCidadeChange: handleCidadeChange,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-10">
        <HeroEventBanner event={featuredEvent} />
      </div>

      <header className="mb-6 flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
        </span>
        <h1 className="font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Eventos e feiras de adoção
        </h1>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        <EventsFiltersSidebar {...filterPanelProps} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-3">
            <EventsControlBar
              search={search}
              onSearchChange={setSearch}
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

          <EventsGrid events={filteredEvents} viewMode={viewMode} onClearFilters={handleClearFilters} />
        </div>
      </div>

      <OngCtaSection />

      <EventsFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredEvents.length}
        {...filterPanelProps}
      />
    </div>
  )
}

export default EventsListPage