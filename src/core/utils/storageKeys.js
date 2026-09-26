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

// 🆕 Favoritos são uma lista pessoal e privada (seção 6.3 das regras de
// negócio): cada usuário tem a própria chave, para que dois logins no mesmo
// navegador não compartilhem — nem sobrescrevam — a lista do outro
export function favoritesStorageKey(userId) {
  return `aucolher_favorites_${userId}`
}

// Última leitura de cada conversa (requestId → ISO timestamp), por conta —
// é o que permite contar mensagens não lidas no badge da sidebar
export function chatLastSeenStorageKey(userId) {
  return `aucolher_chat_last_seen_${userId}`
}

// Eventos em que a conta confirmou presença (seção "Eventos participados")
export function eventAttendanceStorageKey(userId) {
  return `aucolher_event_attendance_${userId}`
}
