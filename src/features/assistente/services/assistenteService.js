import { api } from '../../../core/services/api'

// Assistente de suporte. Rota pública:
// visitante também pergunta; com login, o token vai junto pelo interceptor.
// `history`: as falas anteriores ({ role: 'user' | 'model', text }), porque a
// API não guarda a conversa
export async function sendSupportMessage({ message, history }) {
  const { data } = await api.post('/support/chat', { message, history })
  return data
}
