import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../../core/services/queryKeys'
import { getUserReviews } from '../../adocao/services/adocaoService'

// Perfil sem avaliações (ou que a API não encontrou): tudo zerado
const EMPTY_REVIEWS = {
  reviews: [],
  count: 0,
  average: 0,
  distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
  adoptionsCount: 0,
}

// Avaliações feitas no fim de cada adoção sobre um perfil — o que adotantes
// disseram dele como dono do animal e o que donos disseram dele como
// adotante — com média, distribuição e as adoções concluídas
// (GET /users/{id}/reviews). Salvar ou apagar uma avaliação invalida a chave
export function useUserReviews(profileId) {
  const { data } = useQuery({
    queryKey: queryKeys.adocao.userReviews(profileId),
    queryFn: () => getUserReviews(profileId),
    enabled: profileId != null,
    staleTime: 30_000,
  })

  return data ?? EMPTY_REVIEWS
}
