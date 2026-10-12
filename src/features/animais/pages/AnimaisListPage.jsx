import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaFilter } from 'react-icons/fa6'
import SearchBar from '../components/SearchBar'
import FiltersSidebar from '../components/filters/FiltersSidebar'
import FiltersDrawer from '../components/filters/FiltersDrawer'
import AnimalsGrid from '../components/AnimalsGrid'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import { getErrorMessage } from '../../../core/utils/apiError'
import { useAnimalsList } from '../hooks/useAnimais'

// Mesmos nomes dos filtros da API (species, sizes, sexes...): a filtragem e
// a paginação acontecem no servidor, que só devolve os disponíveis
const INITIAL_FILTERS = {
  species: [],
  sizes: [],
  sexes: [],
  ageGroups: [],
  energyLevels: [],
  temperaments: [],
  specialNeeds: false,
  city: '',
}

// Espera a pessoa parar de digitar antes de buscar — sem isso cada letra
// viraria uma requisição
const SEARCH_DEBOUNCE_MS = 300

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function toggleArrayValue(array, value) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

function AnimaisListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''

  const [search, setSearch] = useState(urlSearch)
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // A URL mudou de fora (ex: nova busca pela Home com esta página já aberta):
  // ajusta o campo durante a renderização, sem um efeito que renderizaria duas vezes
  if (urlSearch !== lastUrlSearch) {
    setLastUrlSearch(urlSearch)
    setSearch(urlSearch)
  }

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAnimalsList({ search: debouncedSearch, filters })

  const animals = data?.pages.flatMap((page) => page.animals) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0

  const handleToggleArrayFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: toggleArrayValue(prev[key], value) }))
  }

  const handleToggleSpecialNeeds = () => {
    setFilters((prev) => ({ ...prev, specialNeeds: !prev.specialNeeds }))
  }

  const handleCityChange = (city) => {
    setFilters((prev) => ({ ...prev, city }))
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
    setSearchParams({}, { replace: true })
  }

  const activeFiltersCount =
    filters.species.length +
    filters.sizes.length +
    filters.sexes.length +
    filters.ageGroups.length +
    filters.energyLevels.length +
    filters.temperaments.length +
    (filters.specialNeeds ? 1 : 0) +
    (filters.city !== '' ? 1 : 0)

  const hasActiveFilters = search !== '' || activeFiltersCount > 0

  const filterPanelProps = {
    filters,
    onToggleArrayFilter: handleToggleArrayFilter,
    onToggleSpecialNeeds: handleToggleSpecialNeeds,
    onCityChange: handleCityChange,
    onClear: handleClearFilters,
    hasActiveFilters,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-2 sm:mb-10">
        <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          {isLoading ? 'Buscando animais...' : `${totalElements} ${totalElements === 1 ? 'animal encontrado' : 'animais encontrados'}`}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
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

          {isError ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="font-bold text-emerald-950">Não foi possível carregar os animais</p>
              <p className="mt-1 text-sm text-slate-500">{getErrorMessage(error)}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
              >
                Tentar de novo
              </button>
            </div>
          ) : (
            <>
              <AnimalsGrid animais={animals} isLoading={isLoading} onClearFilters={handleClearFilters} />

              {hasNextPage && !isFetchingNextPage && (
                <ShowMoreButton onClick={() => fetchNextPage()} remainingCount={totalElements - animals.length} />
              )}
              {isFetchingNextPage && (
                <p className="mt-10 text-center text-sm font-semibold text-slate-400">Carregando mais animais...</p>
              )}
            </>
          )}
        </div>
      </div>

      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        resultsCount={totalElements}
        {...filterPanelProps}
      />
    </div>
  )
}

export default AnimaisListPage
