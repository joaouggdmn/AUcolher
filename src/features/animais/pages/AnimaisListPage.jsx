import { useMemo, useState } from 'react'
import AnimalFilters from '../components/AnimalFilters'
import AnimalsGrid from '../components/AnimalsGrid'
import { mockAnimais } from '../data/mockAnimais'

const INITIAL_FILTERS = { especie: '', porte: '', sexo: '' }

function AnimaisListPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  // 🔴 Quando o backend estiver pronto, substitua as 2 linhas abaixo por:
  // const { data: animais = [], isLoading } = useAnimais({ search, ...filters })
  const isLoading = false
  const animais = mockAnimais

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
  }

  const hasActiveFilters = search !== '' || Object.values(filters).some((v) => v !== '')

  // Filtragem no front — será removida quando a busca/filtro passar a ser feita via query params na API
  const filteredAnimais = useMemo(() => {
    return animais.filter((animal) => {
      const term = search.toLowerCase()
      const matchesSearch =
        search === '' ||
        animal.name.toLowerCase().includes(term) ||
        animal.city.toLowerCase().includes(term)

      const matchesEspecie = filters.especie === '' || animal.species === filters.especie
      const matchesPorte = filters.porte === '' || animal.size === filters.porte
      const matchesSexo = filters.sexo === '' || animal.sex === filters.sexo

      return matchesSearch && matchesEspecie && matchesPorte && matchesSexo
    })
  }, [animais, search, filters])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
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

      <div className="mb-8 sm:mb-10">
        <AnimalFilters
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <AnimalsGrid
        animais={filteredAnimais}
        isLoading={isLoading}
        onClearFilters={handleClearFilters}
      />
    </div>
  )
}

export default AnimaisListPage