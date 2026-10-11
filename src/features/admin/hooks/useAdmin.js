import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { ADMIN_STALE_TIME } from '../../../core/utils/constants'
import {
  dismissAdminReports,
  getAdminStats,
  listAdminAnimals,
  listAdminCampaigns,
  listAdminEvents,
  listAdminReports,
  listAdminUsers,
} from '../services/adminService'

// Só a conta admin busca: para as outras o "servidor" responderia 403
function useAdminQuery(queryKey, queryFn) {
  const { user } = useAuth()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: ADMIN_STALE_TIME,
    enabled: user?.userType === 'ADMIN',
  })
}

// Números e séries da Visão geral
export function useAdminStats() {
  return useAdminQuery(queryKeys.admin.stats, getAdminStats)
}

export function useAdminUsers() {
  return useAdminQuery(queryKeys.admin.users, listAdminUsers)
}

export function useAdminAnimals() {
  return useAdminQuery(queryKeys.admin.animals, listAdminAnimals)
}

export function useAdminCampaigns() {
  return useAdminQuery(queryKeys.admin.campaigns, listAdminCampaigns)
}

export function useAdminEvents() {
  return useAdminQuery(queryKeys.admin.events, listAdminEvents)
}

export function useAdminReports() {
  return useAdminQuery(queryKeys.admin.reports, listAdminReports)
}

// ---------- escrita ----------

// Uma decisão de moderação mexe nos números, nas listas e no "Denúncia em
// análise" de quem denunciou: atualiza o painel inteiro e as denúncias.
// Devolver a promise mantém a mutation pendente até as telas terem os dados novos
function useInvalidateModeration() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.denuncias.all }),
    ])
}

// Arquiva (improcedente) a denúncia e as outras pendentes do mesmo alvo
export function useDismissReports() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: dismissAdminReports,
    onSuccess: invalidate,
  })
}
