import { useAdoptionRequests } from '../context/AdoptionRequestContext'
import { injectSystemMessage } from '../utils/chatSystemMessage'

// Orquestra as mudanças de status que também deixam um registro no chat,
// num único ponto — evita duplicar essa sequência nos vários lugares que
// disparam cada passo (card em "Interesses Recebidos", painel da ONG e
// ChatConversationPanel):
//   Passo 1 (doador): trava o chat e avisa o adotante que precisa
//   confirmar o recebimento do pet
//   Passo 2 (adotante): conclui o pedido (a API cancela os pedidos
//   concorrentes e marca o animal como ADOPTED) e celebra no chat
//   Desistência (qualquer uma das partes): cancela e registra quem desistiu
// Todas rejeitam com o erro da API — quem chama mostra a mensagem; a
// mensagem de sistema só entra quando a API aceitou
export function useConcludeAdoption() {
  const { requestDeliveryConfirmation, concludeRequest, cancelRequest } = useAdoptionRequests()

  async function requestDelivery({ requestId, animalName }) {
    await requestDeliveryConfirmation(requestId)
    injectSystemMessage(
      requestId,
      `O doador confirmou a entrega de ${animalName}. O chat foi bloqueado para novas mensagens — quando o pet chegar até você, confirme o recebimento para concluir a adoção.`,
    )
  }

  async function concludeAdoption({ requestId, animalName }) {
    await concludeRequest(requestId)
    injectSystemMessage(requestId, `Adoção de ${animalName} concluída! Parabéns pelo novo membro da família.`)
  }

  async function cancelAdoption({ requestId, animalName, byOwner }) {
    await cancelRequest(requestId)
    injectSystemMessage(
      requestId,
      byOwner
        ? `O doador desistiu da adoção de ${animalName}. O pedido foi cancelado.`
        : `O adotante cancelou o pedido de adoção de ${animalName}.`,
    )
  }

  return { requestDelivery, concludeAdoption, cancelAdoption }
}
