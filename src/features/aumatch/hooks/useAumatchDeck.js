import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { animalKeys } from '../../animais/hooks/useAnimais'
import { listAnimals } from '../../animais/services/animalService'
import { getMatchDeck } from '../services/aumatchService'

// A maior página que a API aceita na vitrine pública
const PREVIEW_SIZE = 50
const STALE_TIME = 30_000
const NO_PETS = []

// As chaves ficam dentro de animalKeys.all: cadastrar, editar ou adotar um
// animal (e as decisões da moderação) também atualizam o deck. Salvar as
// respostas do quiz invalida `all`, porque o score muda
export const matchDeckKeys = {
  all: [...animalKeys.all, 'match-deck'],
  mine: (userId) => [...animalKeys.all, 'match-deck', String(userId)],
  preview: [...animalKeys.all, 'match-deck', 'preview'],
}

// Os pets do AUmatch. Pessoa física recebe o deck da API, já ordenado pelo
// score de compatibilidade; visitante, ONG e admin veem uma prévia com a
// vitrine pública, sem score (a API do AUmatch é só de quem adota)
export function useAumatchDeck() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const isAdopter = user?.userType === 'PESSOA'

  const deck = useQuery({
    queryKey: matchDeckKeys.mine(user?.id),
    queryFn: getMatchDeck,
    enabled: !isAuthLoading && isAdopter,
    staleTime: STALE_TIME,
  })

  const preview = useQuery({
    queryKey: matchDeckKeys.preview,
    queryFn: async () => (await listAnimals({ size: PREVIEW_SIZE })).animals,
    enabled: !isAuthLoading && !isAdopter,
    staleTime: STALE_TIME,
  })

  const active = isAdopter ? deck : preview

  return {
    pets: active.data ?? NO_PETS,
    isAdopter,
    isLoading: isAuthLoading || active.isLoading,
    isError: active.isError,
    refetch: active.refetch,
  }
}
