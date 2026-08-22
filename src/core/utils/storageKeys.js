// Chave única compartilhada entre api.js e AuthContext.jsx — evita
// divergência de nomes entre quem grava e quem lê o localStorage
export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type' // 🆕 guarda o "tipo" (ex: "Bearer") vindo da API
export const USER_STORAGE_KEY = 'aucolher_user'
export const ADOPTION_REQUESTS_STORAGE_KEY = 'aucolher_adoption_requests'