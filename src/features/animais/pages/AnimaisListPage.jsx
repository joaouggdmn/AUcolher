import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaFilter, FaLocationCrosshairs } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import { useAnimals } from '../../../core/context/AnimalContext'
import { calculateDistanceKm } from '../../../core/utils/distance'

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

// null (ou qualquer valor não-finito) sempre vai para o final: animais sem
// distância calculável (sem lat/lng no cadastro) não devem ser excluídos
// da lista, apenas posicionados por último.
function compareByDistanceNullsLast(distA, distB) {
  const aIsValid = Number.isFinite(distA)
  const bIsValid = Number.isFinite(distB)

  if (!aIsValid && !bIsValid) return 0
  if (!aIsValid) return 1
  if (!bIsValid) return -1
  return distA - distB
}

function AnimaisListPage() {
  const { animals } = useAnimals()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isLoading = false

  // Sincroniza quando a URL muda EXTERNAMENTE (ex: usuário voltou à Home e
  // buscou de novo enquanto já estava nesta página)
  useEffect(() => {
    const paramSearch = searchParams.get('search')
    if (paramSearch !== null && paramSearch !== search) {
      setSearch(paramSearch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Coordenadas de proximidade vindas da URL (?lat=...&lng=...)
  const proximityCoords = useMemo(() => {
    const rawLat = searchParams.get('lat')
    const rawLng = searchParams.get('lng')

    console.log('1. Coordenadas cruas da URL:', { rawLat, rawLng })

    if (!rawLat || !rawLng) {
      console.log('1b. lat ou lng ausentes na URL — proximityCoords = null')
      return null
    }

    const lat = parseFloat(rawLat)
    const lng = parseFloat(rawLng)

    console.log('1c. Coordenadas da URL após parseFloat:', { lat, lng })

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.log('1d. parseFloat retornou valor não-finito — proximityCoords = null')
      return null
    }

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
    // 2. Checagem do que o AnimalContext está de fato entregando — se
    // latitude/longitude vierem undefined aqui, o problema é o cache do
    // localStorage (aucolher_animals), não a lógica de filtragem/sort
    console.log('2. Exemplo de animal em memória (animals[0]):', {
      name: animals[0]?.name,
      latitude: animals[0]?.latitude,
      longitude: animals[0]?.longitude,
    })

    const withDistance = animals.map((animal) => {
      const liveDistanceKm = proximityCoords
        ? calculateDistanceKm(proximityCoords.lat, proximityCoords.lng, animal.latitude, animal.longitude)
        : null

      return { ...animal, liveDistanceKm }
    })

    // 3. Teste do Haversine para o primeiro animal do array
    if (proximityCoords) {
      console.log('3. Distância calculada para o 1º animal:', {
        name: withDistance[0]?.name,
        lat_animal: withDistance[0]?.latitude,
        lng_animal: withDistance[0]?.longitude,
        liveDistanceKm: withDistance[0]?.liveDistanceKm,
      })
    }

    const filtered = withDistance.filter((animal) => {
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

      // Com GPS ativo, o slider manual de distância é 100% ignorado
      const matchesSliderDistance = proximityCoords ? true : animal.distanceKm <= filters.maxDistance

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
        matchesSliderDistance
      )
    })

    if (!proximityCoords) {
      console.log('4. Modo GPS INATIVO — sort() nem é chamado (early return)')
      return filtered
    }

    // 4. Confirma que o sort realmente roda, mostrando ANTES e DEPOIS
    console.log(
      '4a. ANTES do sort:',
      filtered.map((a) => ({ name: a.name, liveDistanceKm: a.liveDistanceKm }))
    )

    const sorted = [...filtered].sort((a, b) => compareByDistanceNullsLast(a.liveDistanceKm, b.liveDistanceKm))

    console.log(
      '4b. DEPOIS do sort:',
      sorted.map((a) => ({ name: a.name, liveDistanceKm: a.liveDistanceKm }))
    )

    return sorted
  }, [animals, search, filters, proximityCoords])

  const filterPanelProps = {
    filters,
    onToggleArrayFilter: handleToggleArrayFilter,
    onToggleSpecialNeeds: handleToggleSpecialNeeds,
    onCityChange: handleCityChange,
    onDistanceChange: handleDistanceChange,
    onClear: handleClearFilters,
    hasActiveFilters,
    isProximityActive: !!proximityCoords,
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