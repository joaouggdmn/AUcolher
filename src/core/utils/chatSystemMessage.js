import { chatMessagesStorageKey } from './storageKeys'

// Nome do evento compartilhado entre quem injeta a mensagem (aqui) e quem
// escuta (useChatMessages) — evita strings mágicas duplicadas em 2 arquivos
export const CHAT_SYSTEM_MESSAGE_EVENT = 'chat:system-message'

// Escreve uma mensagem de sistema direto no histórico de uma conversa,
// sem exigir que useChatMessages esteja montado para aquele requestId.
// Usado pelo useConcludeAdoption para celebrar a adoção mesmo quando a
// confirmação acontece fora da tela de chat (ex: pelo card em
// "Interesses Recebidos").
export function injectSystemMessage(requestId, text) {
  if (!requestId) return

  try {
    const key = chatMessagesStorageKey(requestId)
    const stored = localStorage.getItem(key)
    const messages = stored ? JSON.parse(stored) : []

    const systemMessage = {
      id: Date.now(),
      senderId: 'system',
      text,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem(key, JSON.stringify([...messages, systemMessage]))

    // O evento nativo 'storage' só dispara em OUTRAS abas — este evento
    // customizado cobre o caso do ChatConversationPanel já estar montado
    // NESTA aba, mostrando exatamente esta conversa (ex: doador confirma
    // direto pelo cabeçalho do chat)
    window.dispatchEvent(new CustomEvent(CHAT_SYSTEM_MESSAGE_EVENT, { detail: { requestId } }))
  } catch {
    // best-effort — a confirmação em si (status do pedido/animal) já foi
    // persistida antes desta chamada e não depende disso
  }
}