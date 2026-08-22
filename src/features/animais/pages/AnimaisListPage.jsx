import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaFilter, FaPaw } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import { useAnimals } from '../../../core/context/AnimalContext'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import CreateEntityCta from '../../../core/components/ui/CreateEntityCta'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'

const INITIAL_FILTERS = {
  species: [],
  sizes: [],
  sexes: [],
  ageGroups: [],
  specialNeeds: false,
  city: '',
  maxDistance: 50,
}

const PAGE_SIZE = 12

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function AnimaisListPage() {
  const { animals } = useAnimals()
  const navigate = useNavigate()
  const location = useLocation()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const isLoading = false

  const handleToggleArrayFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: toggleArrayValue(prev[key], value) }))
  }

  const handleToggleSpecialNeeds = () => {
    setFilters((prev) => ({ ...prev, specialNeeds: !prev.specialNeeds }))
  }

  const handleCityChange = (city) => {
    setFilters((prev) => ({ ...prev, city }))
  }

  const handleDistanceChange = (maxDistance) => {
    setFilters((prev) => ({ ...prev, maxDistance }))
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
  }

  const hasActiveFilters =
    search !== '' ||
    filters.species.length > 0 ||
    filters.sizes.length > 0 ||
    filters.sexes.length > 0 ||
    filters.ageGroups.length > 0 ||
    filters.specialNeeds ||
    filters.city !== '' ||
    filters.maxDistance < 50

  const activeFiltersCount =
    filters.species.length +
    filters.sizes.length +
    filters.sexes.length +
    filters.ageGroups.length +
    (filters.specialNeeds ? 1 : 0) +
    (filters.city !== '' ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0)

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        animal.name.toLowerCase().includes(term) ||
        animal.city.toLowerCase().includes(term)

      const matchesSpecies = filters.species.length === 0 || filters.species.includes(animal.species)
      const matchesSize = filters.sizes.length === 0 || filters.sizes.includes(animal.size)
      const matchesSex = filters.sexes.length === 0 || filters.sexes.includes(animal.sex)
      const matchesAgeGroup = filters.ageGroups.length === 0 || filters.ageGroups.includes(animal.ageGroup)
      const matchesSpecialNeeds = !filters.specialNeeds || animal.specialNeeds
      const matchesCity = filters.city === '' || animal.city === filters.city
      const matchesDistance = animal.distanceKm <= filters.maxDistance

      return (
        matchesSearch &&
        matchesSpecies &&
        matchesSize &&
        matchesSex &&
        matchesAgeGroup &&
        matchesSpecialNeeds &&
        matchesCity &&
        matchesDistance
      )
    })
  }, [animals, search, filters])

  // Volta pra "página 1" sempre que busca/filtros mudam — evita manter
  // 36 itens visíveis depois de aplicar um filtro que só bate com 5
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filters])

  const visibleAnimals = filteredAnimals.slice(0, visibleCount)
  const hasMore = visibleCount < filteredAnimals.length

  const filterPanelProps = {
    filters,
    onToggleArrayFilter: handleToggleArrayFilter,
    onToggleSpecialNeeds: handleToggleSpecialNeeds,
    onCityChange: handleCityChange,
    onDistanceChange: handleDistanceChange,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-2 sm:mb-10">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal encontrado' : 'animais encontrados'}
        </span>
        <h1 className="font-serif text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Encontre seu novo melhor amigo
        </h1>
        <p className="max-w-xl text-slate-600">
          Todos esses pets estão esperando por um lar cheio de amor. Use os filtros para encontrar o match perfeito.
        </p>
      </header>

      <div className="lg:flex lg:items-start lg:gap-8">
        <FiltersSidebar {...filterPanelProps} />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-3">
            <SearchBar value={search} onChange={setSearch} />

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

          <AnimalsGrid animais={visibleAnimals} isLoading={isLoading} onClearFilters={handleClearFilters} />

          {!isLoading && hasMore && (
            <ShowMoreButton
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              remainingCount={filteredAnimals.length - visibleCount}
            />
          )}
        </div>
      </div>

      <CreateEntityCta
        icon={FaPaw}
        title="Tem um animal para colocar para adoção?"
        description="Cadastre gratuitamente e ajude-o a encontrar uma família por meio do nosso sistema de match."
        buttonLabel="Cadastrar um animal"
        targetPath="/animais/criar"
        onNeedsLogin={() => setIsAuthModalOpen(true)}
      />

      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredAnimals.length}
        {...filterPanelProps}
      />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para cadastrar um animal, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}
    </div>
  )
}

export default AnimaisListPage