import { useQuery } from '@tanstack/react-query'
import { fetchCitiesByState } from '../services/ibgeService'

// A lista de municípios de um estado não muda na prática: busca uma vez por
// UF e reaproveita pela sessão inteira
export function useCities(uf) {
  return useQuery({
    queryKey: ['ibge-cities', uf],
    queryFn: () => fetchCitiesByState(uf),
    enabled: Boolean(uf),
    staleTime: Infinity,
    retry: 1,
  })
}
