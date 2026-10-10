import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { listFavorites } from '../../animais/services/animalService'

// Chaves dos favoritos. Tudo começa com 'favorites' — é esse prefixo que as
// alterações de animais invalidam (ver useAnimais). Levam o userId porque o
// cache não é limpo no logout
export const favoriteKeys = {
  all: ['favorites'],
  ids: (userId) => ['favorites', 'ids', String(userId)],
  list: (userId) => ['favorites', 'list', String(userId)],
}

// Cards dos favoritos da conta logada, do mais recente para o mais antigo.
// A API já esconde os anúncios tirados do ar; os adotados continuam
export function useFavoriteAnimals() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: favoriteKeys.list(userId),
    queryFn: listFavorites,
    enabled: userId != null,
  })
}
