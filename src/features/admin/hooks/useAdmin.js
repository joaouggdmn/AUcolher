import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { ADMIN_STALE_TIME } from '../../../core/utils/constants'
import {
  banReportedAccount,
  dismissAdminReports,
  getAdminStats,
  listAdminAnimals,
  listAdminCampaigns,
  listAdminEvents,
  listAdminReports,
  listAdminUsers,
  setAdminUserStatus,
} from '../services/adminService'
import { reportedAccount } from '../utils/reportCases'

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

// Uma decisão de moderação mexe nos números, nas listas do painel, no
// "Denúncia em análise" de quem denunciou e no que o site mostra. Devolver a
// promise mantém a mutation pendente até as telas terem os dados novos
function useInvalidateModeration() {
  const queryClient = useQueryClient()
  const queryKeysToRefresh = [
    queryKeys.admin.all,
    queryKeys.denuncias.all,
    queryKeys.moderated.animals,
    queryKeys.moderated.favorites,
    queryKeys.moderated.publicProfile,
    queryKeys.campanhas.all,
    queryKeys.eventos.all,
  ]
  return () => Promise.all(queryKeysToRefresh.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

// Arquiva (improcedente) a denúncia e as outras pendentes do mesmo alvo
export function useDismissReports() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: dismissAdminReports,
    onSuccess: invalidate,
  })
}

// 🔴 Os pedidos de adoção ainda moram no navegador (AdoptionRequestProvider):
// quem cancela os da conta banida é o front. Com os pedidos no backend, o
// próprio PATCH/POST de banimento faz isso
function useCancelRequestsOfBanned() {
  const { cancelRequestsOfBannedAccount } = useAdoptionRequests()
  return cancelRequestsOfBannedAccount
}

// Banir a conta de um caso de denúncia (o perfil ou quem anunciou)
export function useBanReportedAccount() {
  const invalidate = useInvalidateModeration()
  const cancelRequests = useCancelRequestsOfBanned()
  return useMutation({
    mutationFn: (reportCase) => banReportedAccount(reportCase.reports[0].id),
    onSuccess: (_, reportCase) => {
      cancelRequests(reportedAccount(reportCase))
      return invalidate()
    },
  })
}

// { user, active }: banir (false) ou reativar (true) pela lista de Usuários
export function useSetUserStatus() {
  const invalidate = useInvalidateModeration()
  const cancelRequests = useCancelRequestsOfBanned()
  return useMutation({
    mutationFn: ({ user, active }) => setAdminUserStatus(user.id, active),
    onSuccess: (_, { user, active }) => {
      if (!active) cancelRequests(user)
      return invalidate()
    },
  })
}
