import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { CAMPANHAS_STALE_TIME } from '../../../core/utils/constants'
import {
  closeCampaign,
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  listMyCampaigns,
  updateCampaign,
} from '../services/doacaoService'

// ---------- leitura ----------

// Vitrine pública (/campanhas, home, perfil da ONG com `ongId`).
// `status`: 'ACTIVE' (padrão da API) ou 'CLOSED'
export function useCampaigns({ ongId = null, status = 'ACTIVE', enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.campanhas.list({ ongId: ongId == null ? null : String(ongId), status }),
    queryFn: () => listCampaigns({ ongId, status }),
    staleTime: CAMPANHAS_STALE_TIME,
    enabled,
  })
}

export function useCampaign(id) {
  return useQuery({
    queryKey: queryKeys.campanhas.detail(id),
    queryFn: () => getCampaign(id),
    staleTime: CAMPANHAS_STALE_TIME,
    enabled: id != null,
  })
}

// Painel da ONG: ativas e encerradas
export function useMyCampaigns() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.campanhas.mine(userId),
    queryFn: listMyCampaigns,
    staleTime: CAMPANHAS_STALE_TIME,
    enabled: userId != null && user.userType === 'ONG',
  })
}

// ---------- escrita ----------

// Encerrar/excluir também cancela PIX pendentes, então qualquer escrita
// invalida campanhas e doações. Devolver a promise mantém a mutation
// "pendente" até as telas terem os dados novos
function useInvalidateCampaigns() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.campanhas.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.doacoes.all }),
    ])
}

export function useCreateCampaign() {
  const invalidateCampaigns = useInvalidateCampaigns()
  return useMutation({
    mutationFn: (values) => createCampaign(values),
    onSuccess: invalidateCampaigns,
  })
}

export function useUpdateCampaign() {
  const invalidateCampaigns = useInvalidateCampaigns()
  return useMutation({
    mutationFn: ({ id, values }) => updateCampaign(id, values),
    onSuccess: invalidateCampaigns,
  })
}

export function useCloseCampaign() {
  const queryClient = useQueryClient()
  const invalidateCampaigns = useInvalidateCampaigns()

  return useMutation({
    mutationFn: (id) => closeCampaign(id),
    onSuccess: (campaign) => {
      // O detalhe já mostra "Encerrada" sem esperar a nova busca
      queryClient.setQueryData(queryKeys.campanhas.detail(campaign.id), campaign)
      return invalidateCampaigns()
    },
  })
}

export function useDeleteCampaign() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const invalidateCampaigns = useInvalidateCampaigns()

  return useMutation({
    mutationFn: (id) => deleteCampaign(id),
    onSuccess: (_, id) => {
      // Some do painel na hora. Sem await na nova busca: quem excluiu pela
      // página da campanha sai dela antes de o detalhe virar 404
      queryClient.setQueryData(queryKeys.campanhas.mine(user?.id ?? null), (list) =>
        list?.filter((item) => String(item.id) !== String(id))
      )
      invalidateCampaigns()
    },
  })
}
