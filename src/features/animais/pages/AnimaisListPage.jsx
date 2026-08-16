import { useMemo, useState } from 'react'
import { FaFilter } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import { useAnimals } from '../../../core/context/AnimalContext'

const INITIAL_FILTERS = {
  species: [],
  sizes: [],
  sexes: [],
  ageGroups: [],
  specialNeeds: false,
  city: '',
  maxDistance: 50,
}

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function AnimaisListPage() {
  const { animals } = useAnimals()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isLoading = false // 🔴 quando o backend estiver pronto: const { data: animals = [], isLoading } = useAnimalsQuery(...)

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

  const filterPanelProps = {
    filters,
    onToggleArrayFilter: handleToggleArrayFilter,
    onToggleSpecialNeeds: handleToggleSpecialNeeds,
    onCityChange: handleCityChange,
    onDistanceChange: handleDistanceChange,
    onClear: handleClearFilters,
    hasActiveFilters,
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

          <AnimalsGrid animais={filteredAnimals} isLoading={isLoading} onClearFilters={handleClearFilters} />
        </div>
      </div>

      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredAnimals.length}
        {...filterPanelProps}
      />
    </div>
  )
}

export default AnimaisListPage