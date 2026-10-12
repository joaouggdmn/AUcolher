import { createContext, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { addFavorite, listFavoriteIds, removeFavorite } from '../../features/animais/services/animalService'
import { favoriteKeys } from '../../features/favoritos/hooks/useFavoriteAnimals'

const FavoritesContext = createContext(null)

// Os favoritos vivem na API (GET /favorites/ids). O contexto só guarda o
// cache dos ids para os corações dos cards e o contador do menu, que
// precisam saber a resposta sem uma requisição por card.
// Os IDs são sempre normalizados para string: params de rota chegam como
// texto e a API devolve números — comparar tudo como string evita um
// "1 !== '1'" silencioso
export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const queryClient = useQueryClient()
  const idsKey = favoriteKeys.ids(userId)

  const { data: favoritos = [] } = useQuery({
    queryKey: idsKey,
    queryFn: async () => (await listFavoriteIds()).map(String),
    enabled: userId != null,
  })

  // Atualização otimista: o coração muda na hora e volta atrás se a API recusar
  const { mutate } = useMutation({
    mutationFn: ({ id, shouldFavorite }) => (shouldFavorite ? addFavorite(id) : removeFavorite(id)),
    onMutate: async ({ id, shouldFavorite }) => {
      await queryClient.cancelQueries({ queryKey: idsKey })
      const previous = queryClient.getQueryData(idsKey) ?? []
      // Recém-favoritado entra no topo, como na lista da API (mais recente primeiro)
      queryClient.setQueryData(idsKey, shouldFavorite ? [id, ...previous] : previous.filter((favorito) => favorito !== id))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(idsKey, context.previous)
    },
    // Recarrega ids e cards de /favoritos com o que o banco de fato guardou
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
  })

  function isFavorito(petId) {
    return favoritos.includes(String(petId))
  }

  // Retorna false quando não havia sessão — quem chamou usa isso para abrir
  // o convite de login em vez de fingir que salvou
  function toggleFavorito(petId) {
    if (!userId) return false

    const id = String(petId)
    mutate({ id, shouldFavorite: !favoritos.includes(id) })
    return true
  }

  return (
    <FavoritesContext.Provider value={{ favoritos, isFavorito, toggleFavorito, totalFavoritos: favoritos.length }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider')
  return context
}
