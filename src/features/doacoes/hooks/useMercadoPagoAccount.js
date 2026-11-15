import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { connectMercadoPago, disconnectMercadoPago, getMercadoPagoAccount } from '../services/doacaoService'

// Situação da conta do Mercado Pago da ONG logada. Só conta de ONG pergunta
export function useMercadoPagoAccount() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: queryKeys.mercadoPago.account(userId),
    queryFn: getMercadoPagoAccount,
    enabled: userId != null && user.userType === 'ONG',
  })
}

// Conectar e reconectar: leva o navegador ao Mercado Pago, que volta para
// /ong/painel/campanhas?mp=... (o CampaignsPage lê o resultado). Depois do
// sucesso a página já está saindo, então `isSuccess` também conta como "abrindo"
export function useConnectMercadoPago() {
  const mutation = useMutation({
    mutationFn: connectMercadoPago,
    onSuccess: (authorizationUrl) => {
      window.location.assign(authorizationUrl)
    },
  })
  const { reset } = mutation

  // Voltar do Mercado Pago pelo botão do navegador pode restaurar a página
  // como estava (bfcache), com o botão ainda em "abrindo"
  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) reset()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [reset])

  return mutation
}

// Desconectar muda o `acceptingDonations` de todas as campanhas da ONG
export function useDisconnectMercadoPago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectMercadoPago,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.mercadoPago.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.campanhas.all }),
      ]),
  })
}
