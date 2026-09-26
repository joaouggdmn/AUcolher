import { useState } from 'react'
import { INITIAL_MATCH_FILTERS, MAX_DISTANCE_KM } from '../components/filters/matchFilterOptions'

// Estado dos filtros do painel esquerdo do AUmatch. Fica em um hook próprio
// para a página cuidar só do deck de cards — o painel recebe tudo por props
export function useMatchPreferences() {
  const [filters, setFilters] = useState(INITIAL_MATCH_FILTERS)

  const setCity = (city) => setFilters((prev) => ({ ...prev, city }))
  const setMaxDistance = (maxDistance) => setFilters((prev) => ({ ...prev, maxDistance }))
  const setSort = (sort) => setFilters((prev) => ({ ...prev, sort }))
  const clearFilters = () => setFilters(INITIAL_MATCH_FILTERS)

  // A ordenação não entra na contagem: ela nunca esconde pets, só muda a
  // sequência em que aparecem
  const activeFiltersCount =
    (filters.city !== '' ? 1 : 0) + (filters.maxDistance < MAX_DISTANCE_KM ? 1 : 0)

  return {
    filters,
    setCity,
    setMaxDistance,
    setSort,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters: activeFiltersCount > 0 || filters.sort !== INITIAL_MATCH_FILTERS.sort,
  }
}
