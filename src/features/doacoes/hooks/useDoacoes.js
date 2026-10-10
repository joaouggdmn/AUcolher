import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { DONATION_POLL_INTERVAL } from '../../../core/utils/constants'
import {
  createDonation,
  getDonation,
  listMyDonations,
  listReceivedDonations,
  simulateDonationApproval,
} from '../services/doacaoService'

// ---------- leitura ----------

// Uma doação em andamento (modal do PIX). Enquanto PENDING, pergunta de
// novo a cada 3 s; aprovada, expirada ou cancelada, para de perguntar
export function useDonation(id) {
  return useQuery({
    queryKey: queryKeys.doacoes.detail(id),
    queryFn: () => getDonation(id),
    enabled: id != null,
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? DONATION_POLL_INTERVAL : false),
  })
}

// Histórico de quem doou (pessoa ou ONG) — "Meu impacto" em Minha conta
export function useMyDonations() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.doacoes.mine(userId),
    queryFn: listMyDonations,
    enabled: userId != null,
  })
}

// Painel da ONG: doações aprovadas nas campanhas dela
export function useReceivedDonations() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.doacoes.received(userId),
    queryFn: listReceivedDonations,
    enabled: userId != null && user.userType === 'ONG',
  })
}

// ---------- escrita ----------

// { campaignId, amount } → doação PENDING com o PIX. O detalhe já entra no
// cache, então o modal começa o polling sem buscar de novo
export function useCreateDonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, amount }) => createDonation(campaignId, amount),
    onSuccess: (donation) => {
      queryClient.setQueryData(queryKeys.doacoes.detail(donation.id), donation)
    },
  })
}

// Quando o polling encontra a doação aprovada, a barra da campanha e "Meu
// impacto" precisam do novo total — quem chama faz isso uma vez por doação
export function useRefreshAfterApproval() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id ?? null

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.campanhas.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doacoes.mine(userId) }),
    ])
}

// 🔴 Só do mock: faz o papel do Mercado Pago confirmando o pagamento
export function useSimulateDonationApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => simulateDonationApproval(id),
    onSuccess: (donation) => {
      queryClient.setQueryData(queryKeys.doacoes.detail(donation.id), donation)
    },
  })
}
