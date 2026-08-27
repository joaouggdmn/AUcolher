import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaFilter, FaLocationCrosshairs } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import { useAnimals } from '../../../core/context/AnimalContext'
import { calculateDistanceKm } from '../../../core/utils/distance'

const PROXIMITY_RADIUS_KM = 50

const INITIAL_FILTERS = {
  species: [],
  sizes: [],
  sexes: [],
  ageGroups: [],
  energyLevels: [],
  temperaments: [],
  specialNeeds: false,
  city: '',
  maxDistance: 50,
}

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function AnimaisListPage() {
  const { animals } = useAnimals()
  const [searchParams, setSearchParams] = useSearchParams()

  // Inicializa a busca a partir da URL (ex: chegando da Home via
  // /animais?search=thor) — depois disso, o campo se comporta normalmente
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isLoading = false

  // Sincroniza quando a URL muda EXTERNAMENTE (ex: usuário clicou de novo
  // em "Buscar" na Home enquanto já estava nesta página) — não interfere
  // na digitação local, pois só reage a mudanças no objeto searchParams
  useEffect(() => {
    const paramSearch = searchParams.get('search')
    if (paramSearch !== null && paramSearch !== search) {
      setSearch(paramSearch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Coordenadas de proximidade vindas da URL (?lat=...&lng=...) — null
  // quando ausentes ou inválidas, desligando a lógica de proximidade
  const proximityCoords = useMemo(() => {
    const lat = parseFloat(searchParams.get('lat'))
    const lng = parseFloat(searchParams.get('lng'))
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    return { lat, lng }
  }, [searchParams])

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
    setSearchParams({}, { replace: true }) // limpa search/lat/lng também
  }

  const hasActiveFilters =
    search !== '' ||
    !!proximityCoords ||
    filters.species.length > 0 ||
    filters.sizes.length > 0 ||
    filters.sexes.length > 0 ||
    filters.ageGroups.length > 0 ||
    filters.energyLevels.length > 0 ||
    filters.temperaments.length > 0 ||
    filters.specialNeeds ||
    filters.city !== '' ||
    filters.maxDistance < 50

  const activeFiltersCount =
    filters.species.length +
    filters.sizes.length +
    filters.sexes.length +
    filters.ageGroups.length +
    filters.energyLevels.length +
    filters.temperaments.length +
    (filters.specialNeeds ? 1 : 0) +
    (filters.city !== '' ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0)

  const filteredAnimals = useMemo(() => {
    // 1) Anexa a distância calculada (Haversine) a cada animal, se a
    // busca por proximidade estiver ativa
    const withDistance = animals.map((animal) => ({
      ...animal,
      liveDistanceKm: proximityCoords
        ? calculateDistanceKm(proximityCoords.lat, proximityCoords.lng, animal.latitude, animal.longitude)
        : null,
    }))

    // 2) Aplica todos os filtros, incluindo o raio de proximidade
    const matched = withDistance.filter((animal) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        animal.name.toLowerCase().includes(term) ||
        animal.breed.toLowerCase().includes(term) ||
        animal.city.toLowerCase().includes(term) ||
        animal.state.toLowerCase().includes(term)

      const matchesSpecies = filters.species.length === 0 || filters.species.includes(animal.species)
      const matchesSize = filters.sizes.length === 0 || filters.sizes.includes(animal.size)
      const matchesSex = filters.sexes.length === 0 || filters.sexes.includes(animal.sex)
      const matchesAgeGroup = filters.ageGroups.length === 0 || filters.ageGroups.includes(animal.ageGroup)
      const matchesEnergyLevel = filters.energyLevels.length === 0 || filters.energyLevels.includes(animal.energyLevel)
      const matchesTemperament = filters.temperaments.length === 0 || filters.temperaments.includes(animal.temperament)
      const matchesSpecialNeeds = !filters.specialNeeds || animal.specialNeeds
      const matchesCity = filters.city === '' || animal.city === filters.city
      const matchesDistance = animal.distanceKm <= filters.maxDistance

      // Só entra em jogo quando a URL trouxe lat/lng — exige coordenada
      // resolvida E dentro do raio de 50km
      const matchesProximity =
        !proximityCoords || (animal.liveDistanceKm !== null && animal.liveDistanceKm <= PROXIMITY_RADIUS_KM)

      return (
        matchesSearch &&
        matchesSpecies &&
        matchesSize &&
        matchesSex &&
        matchesAgeGroup &&
        matchesEnergyLevel &&
        matchesTemperament &&
        matchesSpecialNeeds &&
        matchesCity &&
        matchesDistance &&
        matchesProximity
      )
    })

    // 3) Busca por proximidade ativa → mais próximos primeiro
    if (proximityCoords) {
      return [...matched].sort((a, b) => (a.liveDistanceKm ?? Infinity) - (b.liveDistanceKm ?? Infinity))
    }

    return matched
  }, [animals, search, filters, proximityCoords])

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

        {proximityCoords && (
          <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <FaLocationCrosshairs size={12} />
            Ordenado pelos mais próximos de você
          </span>
        )}
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