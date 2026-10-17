export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type'
export const USER_STORAGE_KEY = 'aucolher_user'
// Os pedidos de adoção agora vêm da API; esta chave só guarda os pedidos de
// demonstração do painel do admin (adminDemoData, só em dev)
export const ADOPTION_REQUESTS_STORAGE_KEY = 'aucolher_adoption_requests'
// Antigo: as respostas do quiz agora vêm da API (GET /match/profile). O
// AuthContext só apaga o que versões anteriores deixaram nesta chave
export const LEGACY_LIFESTYLE_PROFILE_STORAGE_KEY = 'aucolher_lifestyle_profile'

// "Banco" falso de eventos + presenças (core/services/mock/mockStore.js)
export const MOCK_EVENTOS_STORE_KEY = 'aucolher_mock_eventos'
// "Banco" falso de campanhas + doações (mesmo mockStore)
export const MOCK_CAMPANHAS_STORE_KEY = 'aucolher_mock_campanhas'
// "Banco" falso do painel do admin: as contas da plataforma (mesmo mockStore)
export const MOCK_ADMIN_STORE_KEY = 'aucolher_mock_admin'
// "Banco" falso das denúncias feitas no site (mesmo mockStore)
export const MOCK_DENUNCIAS_STORE_KEY = 'aucolher_mock_denuncias'
// Decisões de moderação do modo mock: contas banidas (mesmo mockStore)
export const MOCK_MODERACAO_STORE_KEY = 'aucolher_mock_moderacao'
export const MOCK_REABANDONO_STORE_KEY = 'aucolher_mock_reabandono'
// Links de "Esqueci minha senha" do modo mock (mesmo mockStore)
export const MOCK_SENHA_STORE_KEY = 'aucolher_mock_senha'
// "Banco" falso do chat: mensagens e marcas de leitura (mesmo mockStore)
export const MOCK_CHAT_STORE_KEY = 'aucolher_mock_chat'
// Contas excluídas no modo mock: o login delas passa a ser recusado (mesmo mockStore)
export const MOCK_EXCLUSAO_STORE_KEY = 'aucolher_mock_exclusao'
// sessionStorage: a sessão caiu porque a conta foi banida (o login avisa)
export const ACCOUNT_SUSPENDED_FLAG_KEY = 'aucolher_account_suspended'
// sessionStorage: a API recusou o token (ex.: a senha foi trocada em outro
// aparelho) e a sessão caiu (o login avisa)
export const SESSION_EXPIRED_FLAG_KEY = 'aucolher_session_expired'

// Formato antigo do chat (uma chave por conversa e uma de leitura por conta):
// só o chatMock lê, uma vez, para converter as conversas para o banco falso
export function chatMessagesStorageKey(requestId) {
  return `chat_messages_${requestId}`
}

export function chatLastSeenStorageKey(userId) {
  return `aucolher_chat_last_seen_${userId}`
}
