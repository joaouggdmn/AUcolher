import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  removeAdminAnimal,
  removeAdminCampaign,
  removeAdminEvent,
  setAdminUserStatus,
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

// 🔴 Banir ou remover um anúncio também "cancela" os pedidos ativos
// envolvidos: no mock, quem mostra isso é a camada de moderação do
// AdoptionRequestProvider (o servidor não muda). Com a moderação no backend,
// o próprio banimento cancela os pedidos no servidor

// Banir a conta de um caso de denúncia (o perfil ou quem anunciou)
export function useBanReportedAccount() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: (reportCase) => banReportedAccount(reportCase.reports[0].id),
    onSuccess: invalidate,
  })
}

// { user, active }: banir (false) ou reativar (true) pela lista de Usuários
export function useSetUserStatus() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: ({ user, active }) => setAdminUserStatus(user.id, active),
    onSuccess: invalidate,
  })
}

// `animal`: { id, ownerId }
export function useRemoveAnimal() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: (animal) => removeAdminAnimal(animal.id),
    onSuccess: invalidate,
  })
}

export function useRemoveCampaign() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: (campaign) => removeAdminCampaign(campaign.id),
    onSuccess: invalidate,
  })
}

export function useRemoveEvent() {
  const invalidate = useInvalidateModeration()
  return useMutation({
    mutationFn: (event) => removeAdminEvent(event.id),
    onSuccess: invalidate,
  })
}
