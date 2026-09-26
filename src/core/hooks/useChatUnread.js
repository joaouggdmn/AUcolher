import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatContacts } from './useChatContacts'
import { CHAT_SYSTEM_MESSAGE_EVENT } from '../utils/chatSystemMessage'
import { CHAT_READ_EVENT, countUnreadMessages, loadChatMessages, loadLastSeen } from '../utils/chatReadState'

// 🔴 mock: as mensagens vivem no localStorage, então o total é recalculado
// a partir dele. Com o backend, vira um único GET de contagem de não lidas.
export function useChatUnread() {
  const { user } = useAuth()
  const { contacts } = useChatContacts()
  const [version, setVersion] = useState(0)

  // Recalcula quando uma conversa é lida/recebe mensagem de sistema nesta
  // aba, ou quando outra aba grava mensagens/leituras
  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1)

    function handleStorage(event) {
      if (event.key?.startsWith('chat_messages_') || event.key?.startsWith('aucolher_chat_last_seen_')) refresh()
    }

    window.addEventListener(CHAT_READ_EVENT, refresh)
    window.addEventListener(CHAT_SYSTEM_MESSAGE_EVENT, refresh)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(CHAT_READ_EVENT, refresh)
      window.removeEventListener(CHAT_SYSTEM_MESSAGE_EVENT, refresh)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const unreadCount = useMemo(() => {
    if (!user) return 0
    const lastSeen = loadLastSeen(user.id)
    return contacts.reduce(
      (total, contact) =>
        total + countUnreadMessages(loadChatMessages(contact.requestId), user.id, lastSeen[contact.requestId]),
      0,
    )
    // version força a releitura do localStorage após os eventos acima
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, contacts, version])

  return { unreadCount }
}
