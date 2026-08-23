import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { chatMessagesStorageKey } from '../../../core/utils/storageKeys'

function loadMessages(requestId) {
  if (!requestId) return []
  try {
    const stored = localStorage.getItem(chatMessagesStorageKey(requestId))
    if (stored) return JSON.parse(stored)
  } catch {
    // payload corrompido — cai para conversa vazia
  }
  return []
}

export function useChatMessages(requestId) {
  const { user } = useAuth()
  const [messages, setMessages] = useState(() => loadMessages(requestId))

  // Recarrega do zero sempre que o usuário troca de conversa selecionada
  useEffect(() => {
    setMessages(loadMessages(requestId))
  }, [requestId])

  // Persiste toda alteração — cada match vira uma "tabela" isolada no localStorage
  useEffect(() => {
    if (!requestId) return
    localStorage.setItem(chatMessagesStorageKey(requestId), JSON.stringify(messages))
  }, [requestId, messages])

  // Sincroniza em tempo real quando a OUTRA aba envia uma mensagem nesta MESMA conversa
  useEffect(() => {
    if (!requestId) return

    function handleStorageChange(event) {
      if (event.key !== chatMessagesStorageKey(requestId) || !event.newValue) return
      try {
        setMessages(JSON.parse(event.newValue))
      } catch {
        // ignora payload inválido
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [requestId])

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim()
      if (!trimmed || !requestId || !user) return

      const newMessage = {
        id: Date.now(),
        senderId: user.id,
        text: trimmed,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMessage])
    },
    [requestId, user]
  )

  return { messages, sendMessage }
}