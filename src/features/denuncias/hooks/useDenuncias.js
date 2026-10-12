import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { DENUNCIAS_STALE_TIME } from '../../../core/utils/constants'
import { createReport, listMyReports } from '../services/denunciaService'

// As denúncias da conta logada: o botão "Denunciar" vira "Denúncia em
// análise" quando já existe uma aberta para o mesmo alvo. O admin não
// denuncia (modera direto pelo painel), então não busca
export function useMyReports() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.denuncias.mine(userId),
    queryFn: listMyReports,
    staleTime: DENUNCIAS_STALE_TIME,
    enabled: userId != null && user.userType !== 'ADMIN',
  })
}

// { targetType, target, reason, description }
export function useCreateReport() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReport,
    onSuccess: (report) => {
      // O botão muda na hora; a nova busca só confere
      queryClient.setQueryData(queryKeys.denuncias.mine(user?.id ?? null), (list) => (list ? [report, ...list] : list))
      queryClient.invalidateQueries({ queryKey: queryKeys.denuncias.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    },
  })
}
