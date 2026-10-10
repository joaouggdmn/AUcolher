import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import {
  changeAnimalStatus,
  createAnimal,
  deleteAnimal,
  getAnimal,
  listAnimals,
  listMyAnimals,
  listUserAnimals,
  updateAnimal,
} from '../services/animalService'

// Listas públicas mudam pouco: 30 s evita refazer a busca a cada navegação
const ANIMALS_STALE_TIME = 30_000

// Chaves do React Query dos animais num lugar só: quem lê e quem invalida
// montam a mesma chave. Tudo começa com 'animals', então invalidar
// `animalKeys.all` atualiza vitrine, detalhes e "meus animais" de uma vez.
// "mine" leva o userId porque o cache não é limpo no logout
export const animalKeys = {
  all: ['animals'],
  list: (search, filters) => ['animals', 'list', { search, filters }],
  detail: (id) => ['animals', 'detail', String(id)],
  mine: (userId) => ['animals', 'mine', String(userId)],
  byUser: (userId) => ['animals', 'user', String(userId)],
}

// ---------- leitura ----------

// Vitrine com filtros, página a página: `fetchNextPage` é o "Mostrar mais"
export function useAnimalsList({ search = '', filters = {} } = {}) {
  return useInfiniteQuery({
    queryKey: animalKeys.list(search, filters),
    queryFn: ({ pageParam }) => listAnimals({ search, filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: ANIMALS_STALE_TIME,
    // Ao trocar um filtro, os cards atuais ficam na tela até a resposta nova
    // chegar, em vez de piscar o esqueleto de carregamento a cada clique
    placeholderData: keepPreviousData,
  })
}

export function useAnimal(id) {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: () => getAnimal(id),
    staleTime: ANIMALS_STALE_TIME,
    enabled: id != null,
    // 404 é resposta definitiva (não existe ou saiu do ar): tentar de novo só atrasa a tela
    retry: (failureCount, error) => error.response?.status !== 404 && failureCount < 1,
  })
}

// "Meus animais": todos os anúncios da conta logada, em qualquer status
export function useMyAnimals() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: animalKeys.mine(userId),
    queryFn: listMyAnimals,
    staleTime: ANIMALS_STALE_TIME,
    enabled: userId != null,
  })
}

// Animais disponíveis de um perfil público
export function useUserAnimals(userId) {
  return useQuery({
    queryKey: animalKeys.byUser(userId),
    queryFn: () => listUserAnimals(userId),
    staleTime: ANIMALS_STALE_TIME,
    enabled: userId != null,
  })
}

// ---------- escrita ----------

// Toda alteração mexe em mais de uma lista (vitrine, meus animais, perfil,
// favoritos), então invalida tudo de animais e favoritos
function useInvalidateAnimals() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: animalKeys.all })
    queryClient.invalidateQueries({ queryKey: ['favorites'] })
  }
}

export function useCreateAnimal() {
  const invalidate = useInvalidateAnimals()
  return useMutation({
    mutationFn: ({ form, photos }) => createAnimal(form, photos),
    onSuccess: invalidate,
  })
}

export function useUpdateAnimal() {
  const invalidate = useInvalidateAnimals()
  return useMutation({
    mutationFn: ({ id, form, photos }) => updateAnimal(id, form, photos),
    onSuccess: invalidate,
  })
}

// Marcar como adotado, tirar do ar ou reativar. A resposta já é o animal
// atualizado: entra direto no cache do detalhe, e a tela muda sem esperar o refetch
export function useChangeAnimalStatus() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAnimals()
  return useMutation({
    mutationFn: ({ id, status }) => changeAnimalStatus(id, status),
    onSuccess: (animal, { id }) => {
      queryClient.setQueryData(animalKeys.detail(id), animal)
      invalidate()
    },
  })
}

// "Excluir" = tirar do ar (exclusão lógica)
export function useDeleteAnimal() {
  const invalidate = useInvalidateAnimals()
  return useMutation({
    mutationFn: (id) => deleteAnimal(id),
    onSuccess: invalidate,
  })
}
