import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendSupportMessage } from '../services/assistenteService'
import { getErrorMessage } from '../../../core/utils/apiError'
import { ASSISTANT_CONVERSATION_KEY } from '../../../core/utils/storageKeys'

// A API usa no máximo as últimas 20 falas (10 perguntas e respostas)
const MAX_HISTORY_ITEMS = 20
export const MAX_MESSAGE_LENGTH = 500

const isValidMessage = (m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string'

// A conversa fica só no sessionStorage: dura enquanto a aba estiver aberta e
// nunca vai para o banco. Navegação privada ou storage bloqueado: começa vazia
function loadConversation() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(ASSISTANT_CONVERSATION_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isValidMessage) : []
  } catch {
    return []
  }
}

function saveConversation(messages) {
  try {
    if (messages.length) sessionStorage.setItem(ASSISTANT_CONVERSATION_KEY, JSON.stringify(messages))
    else sessionStorage.removeItem(ASSISTANT_CONVERSATION_KEY)
  } catch {
    // Sem storage, a conversa vale só até recarregar a página
  }
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function useAssistente() {
  const [messages, setMessages] = useState(loadConversation)
  const [error, setError] = useState(null)
  const { mutate, isPending } = useMutation({ mutationFn: sendSupportMessage })

  useEffect(() => {
    saveConversation(messages)
  }, [messages])

  // Se a pergunta falhar, ela sai da conversa e volta para o campo
  // (onFailed), para a pessoa tentar de novo sem digitar tudo outra vez
  const send = useCallback(
    (rawText, { onFailed } = {}) => {
      const text = rawText.trim()
      if (!text || isPending) return

      const history = messages.slice(-MAX_HISTORY_ITEMS).map(({ role, text: t }) => ({ role, text: t }))
      const question = { id: newId(), role: 'user', text }
      setError(null)
      setMessages((prev) => [...prev, question])

      mutate(
        { message: text, history },
        {
          onSuccess: (data) => {
            setMessages((prev) => [...prev, { id: newId(), role: 'model', text: data.reply }])
          },
          onError: (err) => {
            setMessages((prev) => prev.filter((m) => m.id !== question.id))
            setError(getErrorMessage(err, 'Não consegui falar com o assistente. Tente de novo.'))
            onFailed?.(text)
          },
        }
      )
    },
    [messages, isPending, mutate]
  )

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, send, isSending: isPending, error, clear }
}
