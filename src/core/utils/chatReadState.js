import { chatLastSeenStorageKey, chatMessagesStorageKey } from './storageKeys'

// Disparado na MESMA aba quando uma conversa é marcada como lida — o evento
// nativo 'storage' só chega nas outras abas
export const CHAT_READ_EVENT = 'chat:read'

export function loadLastSeen(userId) {
  if (!userId) return {}
  try {
    const stored = localStorage.getItem(chatLastSeenStorageKey(userId))
    const parsed = stored ? JSON.parse(stored) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function loadChatMessages(requestId) {
  try {
    const stored = localStorage.getItem(chatMessagesStorageKey(requestId))
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Conta como não lida qualquer mensagem de OUTRA pessoa (ou do sistema)
// posterior à última vez que o usuário abriu aquela conversa
export function countUnreadMessages(messages, userId, lastSeenAt) {
  const lastSeenTime = lastSeenAt ? new Date(lastSeenAt).getTime() : 0
  return messages.filter(
    (message) => message.senderId !== userId && new Date(message.timestamp).getTime() > lastSeenTime,
  ).length
}

export function markConversationSeen(userId, requestId, seenAt = new Date().toISOString()) {
  if (!userId || !requestId) return

  const lastSeen = loadLastSeen(userId)
  if (lastSeen[requestId] && new Date(lastSeen[requestId]) >= new Date(seenAt)) return

  try {
    localStorage.setItem(chatLastSeenStorageKey(userId), JSON.stringify({ ...lastSeen, [requestId]: seenAt }))
    window.dispatchEvent(new CustomEvent(CHAT_READ_EVENT, { detail: { requestId } }))
  } catch {
    // best-effort — no pior caso o badge continua mostrando a conversa
  }
}
