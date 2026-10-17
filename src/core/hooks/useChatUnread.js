import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useChatContacts } from './useChatContacts'
import { queryKeys } from '../services/queryKeys'
import { CHAT_SUMMARY_POLL_MS } from '../utils/constants'
import * as chatService from '../../features/chat/services/chatService'

const NO_CONVERSATIONS = []

// Não lidas e última mensagem de cada conversa, do GET /chats/summary
// (api-chat.md §2.4), a cada 20 s. O total soma só as conversas que estão nos
// contatos da conta: no mock, o resumo traz as conversas de todas as contas
// que já usaram este navegador
export function useChatUnread() {
  const { user } = useAuth()
  const { contacts } = useChatContacts()
  // Admin não tem chat
  const takesPart = user?.userType === 'PESSOA' || user?.userType === 'ONG'

  const { data: summary = NO_CONVERSATIONS } = useQuery({
    queryKey: queryKeys.chat.summary(user?.id),
    queryFn: chatService.getSummary,
    enabled: takesPart,
    refetchInterval: CHAT_SUMMARY_POLL_MS,
  })

  // `conversations`: não lidas e última mensagem de cada conversa, por requestId
  return useMemo(() => {
    const byRequest = new Map(summary.map((conversation) => [String(conversation.requestId), conversation]))
    const conversations = {}
    let unreadCount = 0
    for (const contact of contacts) {
      const conversation = byRequest.get(String(contact.requestId))
      const unread = conversation?.unreadCount ?? 0
      const lastMessage = conversation?.lastMessage ? chatService.withSystemText(conversation.lastMessage, contact) : null
      conversations[contact.requestId] = { unread, lastMessage }
      unreadCount += unread
    }
    return { unreadCount, conversations }
  }, [summary, contacts])
}
