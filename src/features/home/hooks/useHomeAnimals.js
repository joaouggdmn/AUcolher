import { useQuery } from '@tanstack/react-query'
import { animalKeys } from '../../animais/hooks/useAnimais'
import { listAnimals } from '../../animais/services/animalService'

// Uma página só, grande o bastante para a home ranquear e contar tudo de uma
// vez (vitrine, números do hero, pets por ONG)
const HOME_PAGE_SIZE = 100

const NO_ANIMALS = []

// Os animais da home vêm da mesma API que /animais e /animais/:id: assim o
// "Conhecer" de cada card abre exatamente o pet mostrado. A listagem pública
// já devolve só os disponíveis. A chave começa com animalKeys.all, então
// cadastrar, editar ou adotar um animal também atualiza a home
export function useHomeAnimals() {
  const { data, isLoading } = useQuery({
    queryKey: [...animalKeys.all, 'home'],
    queryFn: () => listAnimals({ size: HOME_PAGE_SIZE }),
    staleTime: 30_000,
  })

  return { animals: data?.animals ?? NO_ANIMALS, isLoading }
}
