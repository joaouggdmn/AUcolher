export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type'
export const USER_STORAGE_KEY = 'aucolher_user'
export const ADOPTION_REQUESTS_STORAGE_KEY = 'aucolher_adoption_requests'
// _v2: os animais salvos pela versão anterior usavam M/F, ANOS/MESES e ADOTADO;
// com a chave nova eles são descartados e o mock recomeça do seed atual
export const ANIMALS_STORAGE_KEY = 'aucolher_animals_v2'
export const LIFESTYLE_PROFILE_STORAGE_KEY = 'aucolher_lifestyle_profile' // 🆕

// "Banco" falso de eventos + presenças (core/services/mock/mockStore.js)
export const MOCK_EVENTOS_STORE_KEY = 'aucolher_mock_eventos'

// Chave dinâmica: cada conversa (match aceito) tem seu próprio histórico
// isolado no localStorage — centralizado aqui para não haver 2 lugares
// construindo essa string de formas diferentes
export function chatMessagesStorageKey(requestId) {
  return `chat_messages_${requestId}`
}

// Última leitura de cada conversa (requestId → ISO timestamp), por conta —
// é o que permite contar mensagens não lidas no badge da sidebar
export function chatLastSeenStorageKey(userId) {
  return `aucolher_chat_last_seen_${userId}`
}
