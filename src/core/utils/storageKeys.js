export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type'
export const USER_STORAGE_KEY = 'aucolher_user'
export const ADOPTION_REQUESTS_STORAGE_KEY = 'aucolher_adoption_requests'
export const ANIMALS_STORAGE_KEY = 'aucolher_animals'
export const LIFESTYLE_PROFILE_STORAGE_KEY = 'aucolher_lifestyle_profile' // 🆕

// Chave dinâmica: cada conversa (match aceito) tem seu próprio histórico
// isolado no localStorage — centralizado aqui para não haver 2 lugares
// construindo essa string de formas diferentes
export function chatMessagesStorageKey(requestId) {
  return `chat_messages_${requestId}`
}