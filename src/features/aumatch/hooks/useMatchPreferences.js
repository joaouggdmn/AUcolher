import { useState } from 'react'
import { INITIAL_MATCH_FILTERS } from '../components/filters/matchFilterOptions'

// Estado dos filtros do painel esquerdo do AUmatch. Fica em um hook próprio
// para a página cuidar só do deck de cards — o painel recebe tudo por props
export function useMatchPreferences() {
  const [filters, setFilters] = useState(INITIAL_MATCH_FILTERS)

  const setCity = (city) => setFilters((prev) => ({ ...prev, city }))
  const clearFilters = () => setFilters(INITIAL_MATCH_FILTERS)

  const activeFiltersCount = filters.city !== '' ? 1 : 0

  return {
    filters,
    setCity,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters: activeFiltersCount > 0,
  }
}
