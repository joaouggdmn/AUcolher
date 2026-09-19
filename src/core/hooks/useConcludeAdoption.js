import { useAdoptionRequests } from '../context/AdoptionRequestContext'
import { injectSystemMessage } from '../utils/chatSystemMessage'

// Orquestra as atualizações de estado exigidas pelo handshake de conclusão
// em 2 passos, num único ponto — evita duplicar essa sequência nos vários
// lugares que disparam cada passo (card em "Interesses Recebidos" e
// ChatConversationPanel):
//   Passo 1 (doador): trava o chat e avisa o adotante que precisa
//   confirmar o recebimento do pet
//   Passo 2 (adotante): conclui o pedido (o contexto cancela os pedidos
//   concorrentes e marca o animal como ADOTADO) e celebra no chat
export function useConcludeAdoption() {
  const { requestDeliveryConfirmation, concludeRequest } = useAdoptionRequests()

  function requestDelivery({ requestId, animalName }) {
    requestDeliveryConfirmation(requestId)
    injectSystemMessage(
      requestId,
      `O doador confirmou a entrega de ${animalName}. O chat foi bloqueado para novas mensagens — quando o pet chegar até você, confirme o recebimento para concluir a adoção.`,
    )
  }

  function concludeAdoption({ requestId, animalName }) {
    if (!concludeRequest(requestId)) return
    injectSystemMessage(requestId, `Adoção de ${animalName} concluída! Parabéns pelo novo membro da família.`)
  }

  return { requestDelivery, concludeAdoption }
}
