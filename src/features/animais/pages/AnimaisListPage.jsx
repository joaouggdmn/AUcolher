import { useMemo, useState } from 'react'
import { FaFilter } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import { mockAnimais } from '../data/mockAnimais'

const INITIAL_FILTERS = {
  especies: [],
  portes: [],
  sexos: [],
  idades: [],
  necessidadesEspeciais: false,
  cidade: '',
  distanciaMax: 50,
}

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function AnimaisListPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 🔴 Quando o backend estiver pronto, substitua as 2 linhas abaixo por:
  // const { data: animais = [], isLoading } = useAnimais({ search, ...filters })
  const isLoading = false
  const animais = mockAnimais

  const handleToggleArrayFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: toggleArrayValue(prev[key], value) }))
  }

  const handleToggleSpecialNeeds = () => {
    setFilters((prev) => ({ ...prev, necessidadesEspeciais: !prev.necessidadesEspeciais }))
  }

  const handleCidadeChange = (cidade) => {
    setFilters((prev) => ({ ...prev, cidade }))
  }

  const handleDistanceChange = (distanciaMax) => {
    setFilters((prev) => ({ ...prev, distanciaMax }))
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
  }

  const hasActiveFilters =
    search !== '' ||
    filters.especies.length > 0 ||
    filters.portes.length > 0 ||
    filters.sexos.length > 0 ||
    filters.idades.length > 0 ||
    filters.necessidadesEspeciais ||
    filters.cidade !== '' ||
    filters.distanciaMax < 50

  const activeFiltersCount =
    filters.especies.length +
    filters.portes.length +
    filters.sexos.length +
    filters.idades.length +
    (filters.necessidadesEspeciais ? 1 : 0) +
    (filters.cidade !== '' ? 1 : 0) +
    (filters.distanciaMax < 50 ? 1 : 0)

  // Filtragem no front — será substituída por query params na API futuramente
  const filteredAnimais = useMemo(() => {
    return animais.filter((animal) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        animal.name.toLowerCase().includes(term) ||
        animal.city.toLowerCase().includes(term)

      const matchesEspecie = filters.especies.length === 0 || filters.especies.includes(animal.species)
      const matchesPorte = filters.portes.length === 0 || filters.portes.includes(animal.size)
      const matchesSexo = filters.sexos.length === 0 || filters.sexos.includes(animal.sex)
      const matchesIdade = filters.idades.length === 0 || filters.idades.includes(animal.ageGroup)
      const matchesSpecialNeeds = !filters.necessidadesEspeciais || animal.specialNeeds
      const matchesCidade = filters.cidade === '' || animal.city === filters.cidade
      const matchesDistance = animal.distanceKm <= filters.distanciaMax

      return (
        matchesSearch &&
        matchesEspecie &&
        matchesPorte &&
        matchesSexo &&
        matchesIdade &&
        matchesSpecialNeeds &&
        matchesCidade &&
        matchesDistance
      )
    })
  }, [animais, search, filters])

  const filterPanelProps = {
    filters,
    onToggleArrayFilter: handleToggleArrayFilter,
    onToggleSpecialNeeds: handleToggleSpecialNeeds,
    onCidadeChange: handleCidadeChange,
    onDistanceChange: handleDistanceChange,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  return (
    // pt-24/lg:pt-28 compensa a Navbar fixa, que não reserva espaço próprio no layout
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-2 sm:mb-10">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {filteredAnimais.length} {filteredAnimais.length === 1 ? 'animal encontrado' : 'animais encontrados'}
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

          <AnimalsGrid animais={filteredAnimais} isLoading={isLoading} onClearFilters={handleClearFilters} />
        </div>
      </div>

      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={filteredAnimais.length}
        {...filterPanelProps}
      />
    </div>
  )
}

export default AnimaisListPage