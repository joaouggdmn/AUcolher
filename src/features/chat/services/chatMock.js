import { createMockStore, getMockSession, isSameId, mockDelay, mockHttpError, nextId } from '../../../core/services/mock/mockStore'
import { CHAT_MESSAGE_MAX_LENGTH } from '../../../core/utils/constants'
import { nowLocalIso, toLocalIsoDateTime } from '../../../core/utils/localDate'
import { MOCK_CHAT_STORE_KEY, chatLastSeenStorageKey, chatMessagesStorageKey } from '../../../core/utils/storageKeys'

// 🔴 "Servidor falso" do chat (USE_MOCK_CHAT), até as rotas da migração 011
// existirem (docs/entrega-final/api-chat.md). Mesmas funções e mesmos DTOs do
// chatApi.js, guardados em duas tabelas, como no banco:
// - `messages`: { id, requestId, type, senderId, text, systemEvent, createdAt };
// - `reads`: { requestId, userId, lastReadMessageId }.
// Limitações: as conversas só existem neste navegador, e o envio não confere
// o status do pedido (o mock não conhece os pedidos; a tela já esconde o campo
// de texto fora de ACCEPTED)
const store = createMockStore({ key: MOCK_CHAT_STORE_KEY, version: 1, seed: importLegacyChat })

// ---------- formato antigo ----------

const LEGACY_MESSAGES_KEY = /^chat_messages_(.+)$/
const LEGACY_LAST_SEEN_KEY = /^aucolher_chat_last_seen_(.+)$/

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function localStorageKeys() {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
}

// Antes do banco falso, cada conversa era uma chave (`chat_messages_{id}`) e
// a leitura era a data da última visita por conta. Na primeira vez, tudo isso
// vira as duas tabelas. As chaves antigas ficam onde estão
function importLegacyChat() {
  const legacy = []
  for (const key of localStorageKeys()) {
    const requestId = key?.match(LEGACY_MESSAGES_KEY)?.[1]
    const stored = requestId ? readJson(chatMessagesStorageKey(requestId), []) : null
    if (!Array.isArray(stored)) continue
    for (const message of stored) {
      const time = new Date(message?.timestamp).getTime()
      if (!message?.text || Number.isNaN(time)) continue
      legacy.push({ requestId, message, time })
    }
  }

  const messages = legacy
    .sort((a, b) => a.time - b.time)
    .map(({ requestId, message, time }, index) => {
      const isSystem = message.senderId === 'system'
      return {
        id: index + 1,
        requestId,
        type: isSystem ? 'SYSTEM' : 'USER',
        senderId: isSystem ? null : message.senderId,
        // Aviso antigo: o texto pronto, sem código de evento
        text: message.text,
        systemEvent: null,
        createdAt: toLocalIsoDateTime(new Date(time)),
      }
    })

  // "Li até tal hora" vira "li até tal mensagem"
  const reads = []
  for (const key of localStorageKeys()) {
    const userId = key?.match(LEGACY_LAST_SEEN_KEY)?.[1]
    const lastSeen = userId ? readJson(chatLastSeenStorageKey(userId), {}) : null
    if (!lastSeen || typeof lastSeen !== 'object') continue
    for (const [requestId, seenAt] of Object.entries(lastSeen)) {
      const seenTime = new Date(seenAt).getTime()
      const lastReadMessageId = messages
        .filter((row) => isSameId(row.requestId, requestId) && new Date(row.createdAt).getTime() <= seenTime)
        .reduce((max, row) => Math.max(max, row.id), 0)
      reads.push({ requestId, userId, lastReadMessageId })
    }
  }

  return { messages, reads }
}

// ---------- apoio ----------

function requireSession() {
  const user = getMockSession()
  if (!user) throw mockHttpError(401, 'Faça login para continuar.')
  if (user.userType === 'ADMIN') throw mockHttpError(403, 'Contas de admin não acessam o chat.')
  return user
}

function toMessageDto(row) {
  return {
    id: row.id,
    type: row.type,
    senderId: row.senderId,
    text: row.text,
    systemEvent: row.systemEvent,
    createdAt: row.createdAt,
  }
}

function byId(a, b) {
  return a.id - b.id
}

function lastReadOf(db, requestId, userId) {
  const read = db.reads.find((row) => isSameId(row.requestId, requestId) && isSameId(row.userId, userId))
  return read?.lastReadMessageId ?? 0
}

function insertMessage(db, fields) {
  const row = { id: nextId(db.messages), createdAt: nowLocalIso(), ...fields, requestId: String(fields.requestId) }
  store.write({ ...db, messages: [...db.messages, row] })
  return row
}

// ---------- rotas ----------

// GET /api/chats/summary. Sem os pedidos, o mock lista toda conversa que tem
// mensagem neste navegador, de qualquer conta: quem chama cruza com os
// próprios contatos (useChatUnread) e soma só as dele
export async function getSummary() {
  await mockDelay()
  const user = requireSession()
  const db = store.read()

  const byRequest = new Map()
  for (const row of [...db.messages].sort(byId)) {
    byRequest.set(row.requestId, [...(byRequest.get(row.requestId) ?? []), row])
  }

  const conversations = [...byRequest.entries()]
    .map(([requestId, rows]) => {
      const lastRead = lastReadOf(db, requestId, user.id)
      return {
        requestId: Number(requestId) || requestId,
        unreadCount: rows.filter((row) => row.id > lastRead && !isSameId(row.senderId, user.id)).length,
        lastMessage: toMessageDto(rows.at(-1)),
      }
    })
    .sort((a, b) => b.lastMessage.id - a.lastMessage.id)

  return {
    totalUnread: conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    conversations,
  }
}

// GET /api/chats/{requestId}/messages?after=
export async function listMessages(requestId, after) {
  await mockDelay()
  requireSession()
  return store
    .read()
    .messages.filter((row) => isSameId(row.requestId, requestId) && (after == null || row.id > after))
    .sort(byId)
    .map(toMessageDto)
}

// POST /api/chats/{requestId}/messages
export async function sendMessage(requestId, text) {
  await mockDelay()
  const user = requireSession()
  const trimmed = String(text ?? '').trim()
  if (!trimmed) throw mockHttpError(400, 'Escreva uma mensagem.')
  if (trimmed.length > CHAT_MESSAGE_MAX_LENGTH) {
    throw mockHttpError(400, `A mensagem pode ter no máximo ${CHAT_MESSAGE_MAX_LENGTH} caracteres.`)
  }

  const row = insertMessage(store.read(), { requestId, type: 'USER', senderId: user.id, text: trimmed, systemEvent: null })
  return toMessageDto(row)
}

// PUT /api/chats/{requestId}/read — a marca só anda para frente
export async function markRead(requestId, lastMessageId) {
  await mockDelay()
  const user = requireSession()
  if (lastMessageId == null || Number(lastMessageId) < 0) throw mockHttpError(400, 'Informe a última mensagem lida.')

  const db = store.read()
  const current = lastReadOf(db, requestId, user.id)
  if (Number(lastMessageId) <= current) return

  const others = db.reads.filter((row) => !(isSameId(row.requestId, requestId) && isSameId(row.userId, user.id)))
  store.write({
    ...db,
    reads: [...others, { requestId: String(requestId), userId: user.id, lastReadMessageId: Number(lastMessageId) }],
  })
}

// Só do mock: faz o papel do backend, que cria o aviso de sistema na mesma
// transação da troca de status do pedido
export function recordSystemEvent(requestId, systemEvent) {
  insertMessage(store.read(), { requestId, type: 'SYSTEM', senderId: null, text: null, systemEvent })
}
