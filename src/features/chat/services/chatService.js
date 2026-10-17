import { USE_MOCK_CHAT } from '../../../core/utils/constants'
import * as chatApi from './chatApi'
import * as chatMock from './chatMock'

// Fachada do chat: os hooks só conhecem estas funções e o modelo da tela.
// Quem fala com o "servidor" é o adaptador — API real ou mock, os dois com as
// mesmas funções e os mesmos DTOs (docs/entrega-final/api-chat.md)
const adapter = USE_MOCK_CHAT ? chatMock : chatApi

// No mock, a linha de retorno/repasse da conversa sai do próprio pedido; com
// a API, ela chega como mensagem de sistema (ANIMAL_RETURNED / ANIMAL_REHOMED)
export const SHOWS_RETURN_LINE_FROM_REQUEST = USE_MOCK_CHAT

export const RETURN_SYSTEM_EVENTS = ['ANIMAL_RETURNED', 'ANIMAL_REHOMED']

// ---------- mapper DTO → modelo da tela ----------

// O modelo de sempre da tela: `senderId: 'system'` nos avisos e `timestamp`
export function toFrontendMessage(dto) {
  const isSystem = dto.type === 'SYSTEM'
  return {
    id: dto.id,
    senderId: isSystem ? 'system' : dto.senderId,
    text: dto.text ?? null,
    systemEvent: dto.systemEvent ?? null,
    timestamp: dto.createdAt,
  }
}

// O backend guarda o código do aviso; a frase em português é montada aqui,
// com o nome do animal e, no repasse, de quem republicou. Aviso sem código
// (conversas antigas do mock) já vem com o texto pronto
export function systemMessageText(message, contact) {
  const animal = contact?.animalName ?? 'o animal'
  switch (message.systemEvent) {
    case 'DELIVERY_REQUESTED':
      return `O doador confirmou a entrega de ${animal}. O chat foi bloqueado para novas mensagens. Quando o pet chegar até você, confirme o recebimento para concluir a adoção.`
    case 'DELIVERY_DECLINED':
      return `O adotante avisou que ${animal} ainda não chegou. O chat foi liberado para vocês combinarem a entrega.`
    case 'ADOPTION_CONCLUDED':
      return `Adoção de ${animal} concluída! Parabéns pelo novo membro da família.`
    case 'ADOPTER_WITHDREW':
      return `O adotante cancelou o pedido de adoção de ${animal}.`
    case 'OWNER_WITHDREW':
      return `O doador desistiu da adoção de ${animal}. O pedido foi cancelado.`
    case 'ANIMAL_RETURNED':
      return `${animal} voltou para quem doou.`
    case 'ANIMAL_REHOMED':
      return contact?.isOwnerView
        ? `${contact.name} anunciou ${animal} para uma nova adoção.`
        : `Você anunciou ${animal} para uma nova adoção.`
    default:
      return message.text
  }
}

// A mensagem com o texto final, pronta para a tela ou para a prévia
export function withSystemText(message, contact) {
  return message.senderId === 'system' ? { ...message, text: systemMessageText(message, contact) } : message
}

// ---------- chamadas ----------

// DTO do resumo (api-chat.md §2.4), com a última mensagem já no modelo da tela
export async function getSummary() {
  const summary = await adapter.getSummary()
  return summary.conversations.map((conversation) => ({
    requestId: conversation.requestId,
    unreadCount: conversation.unreadCount,
    lastMessage: conversation.lastMessage ? toFrontendMessage(conversation.lastMessage) : null,
  }))
}

export async function listMessages(requestId, after) {
  return (await adapter.listMessages(requestId, after)).map(toFrontendMessage)
}

export async function sendMessage(requestId, text) {
  return toFrontendMessage(await adapter.sendMessage(requestId, text))
}

export function markRead(requestId, lastMessageId) {
  return adapter.markRead(requestId, lastMessageId)
}

// Depois de uma troca de status que deu certo: com a API, o backend já criou
// o aviso na mesma transação; no mock, é aqui que ele entra na conversa
export function recordStatusEvent(requestId, systemEvent) {
  if (USE_MOCK_CHAT) chatMock.recordSystemEvent(requestId, systemEvent)
}
