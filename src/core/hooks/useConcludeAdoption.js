import { useQueryClient } from '@tanstack/react-query'
import { useAdoptionRequests } from '../context/AdoptionRequestContext'
import { queryKeys } from '../services/queryKeys'
import { recordStatusEvent } from '../../features/chat/services/chatService'

const CONVERSATION_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY']

// Orquestra as mudanças de status que também deixam um registro no chat,
// num único ponto — evita duplicar essa sequência nos vários lugares que
// disparam cada passo (card em "Interesses Recebidos", painel da ONG e
// ChatConversationPanel):
//   Passo 1 (doador): trava o chat e avisa o adotante que precisa
//   confirmar o recebimento do pet
//   Passo 2 (adotante): conclui o pedido (a API cancela os pedidos
//   concorrentes e marca o animal como ADOPTED) e celebra no chat
//   "Ainda não recebi" (adotante): o pet não chegou, o pedido volta a
//   aceito e o chat reabre para combinar a entrega
//   Desistência (qualquer uma das partes): cancela e registra quem desistiu
// Todas rejeitam com o erro da API — quem chama mostra a mensagem. O aviso
// no chat é criado pelo backend na mesma transação (api-chat.md §1); no mock,
// o recordStatusEvent faz esse papel. Depois, a conversa e o badge recarregam
export function useConcludeAdoption() {
  const { requestDeliveryConfirmation, concludeRequest, declineDelivery: declineDeliveryRequest, cancelRequest } =
    useAdoptionRequests()
  const queryClient = useQueryClient()

  function afterStatusChange(requestId, systemEvent) {
    recordStatusEvent(requestId, systemEvent)
    queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(requestId) })
    queryClient.invalidateQueries({ queryKey: [...queryKeys.chat.all, 'summary'] })
  }

  async function requestDelivery({ requestId }) {
    await requestDeliveryConfirmation(requestId)
    afterStatusChange(requestId, 'DELIVERY_REQUESTED')
  }

  async function concludeAdoption({ requestId }) {
    await concludeRequest(requestId)
    afterStatusChange(requestId, 'ADOPTION_CONCLUDED')
  }

  async function declineDelivery({ requestId }) {
    await declineDeliveryRequest(requestId)
    afterStatusChange(requestId, 'DELIVERY_DECLINED')
  }

  // Só um pedido que já tinha conversa (aceito ou aguardando entrega) ganha
  // o aviso: cancelar um pedido pendente não fala nada no chat
  async function cancelAdoption({ requestId, byOwner, fromStatus }) {
    await cancelRequest(requestId)
    if (CONVERSATION_STATUSES.includes(fromStatus)) {
      afterStatusChange(requestId, byOwner ? 'OWNER_WITHDREW' : 'ADOPTER_WITHDREW')
    }
  }

  return { requestDelivery, concludeAdoption, declineDelivery, cancelAdoption }
}
