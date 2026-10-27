export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type'
export const USER_STORAGE_KEY = 'aucolher_user'
// Antigo: pedidos de demonstração do painel do admin. O AuthContext só apaga
// o que versões anteriores deixaram nesta chave
export const LEGACY_ADOPTION_REQUESTS_STORAGE_KEY = 'aucolher_adoption_requests'
// Antigo: as respostas do quiz agora vêm da API (GET /match/profile). O
// AuthContext só apaga o que versões anteriores deixaram nesta chave
export const LEGACY_LIFESTYLE_PROFILE_STORAGE_KEY = 'aucolher_lifestyle_profile'

// Antigo: o "banco" falso de eventos + presenças. Os eventos agora vêm da
// API; o AuthContext só apaga o que versões anteriores deixaram nesta chave
export const LEGACY_MOCK_EVENTOS_STORAGE_KEY = 'aucolher_mock_eventos'
// "Banco" falso de campanhas + doações (mesmo mockStore)
export const MOCK_CAMPANHAS_STORE_KEY = 'aucolher_mock_campanhas'
// Antigo: o "banco" falso do painel do admin. O painel agora vem da API; o
// AuthContext só apaga o que versões anteriores deixaram nesta chave
export const LEGACY_MOCK_ADMIN_STORAGE_KEY = 'aucolher_mock_admin'
// "Banco" falso das denúncias feitas no site (mesmo mockStore)
export const MOCK_DENUNCIAS_STORE_KEY = 'aucolher_mock_denuncias'
// Antigo: as decisões de moderação do modo mock. A moderação agora é do
// backend; o AuthContext só apaga o que versões anteriores deixaram aqui
export const LEGACY_MOCK_MODERACAO_STORAGE_KEY = 'aucolher_mock_moderacao'
export const MOCK_REABANDONO_STORE_KEY = 'aucolher_mock_reabandono'
// Links de "Esqueci minha senha" do modo mock (mesmo mockStore)
export const MOCK_SENHA_STORE_KEY = 'aucolher_mock_senha'
// "Banco" falso do chat: mensagens e marcas de leitura (mesmo mockStore)
export const MOCK_CHAT_STORE_KEY = 'aucolher_mock_chat'
// Contas excluídas no modo mock: o login delas passa a ser recusado (mesmo mockStore)
export const MOCK_EXCLUSAO_STORE_KEY = 'aucolher_mock_exclusao'
// AUmatch: a coluna de filtros do desktop ficou aberta ("1") ou guardada
export const AUMATCH_PANEL_OPEN_KEY = 'aucolher_aumatch_panel_open'
// sessionStorage: a sessão caiu porque a conta foi banida (o login avisa)
export const ACCOUNT_SUSPENDED_FLAG_KEY = 'aucolher_account_suspended'
// sessionStorage: a API recusou o token (ex.: a senha foi trocada em outro
// aparelho) e a sessão caiu (o login avisa)
export const SESSION_EXPIRED_FLAG_KEY = 'aucolher_session_expired'
// sessionStorage: a página de onde a pessoa foi entrar com o Google (o
// state do router se perde na ida e volta ao Google)
export const GOOGLE_LOGIN_RETURN_KEY = 'aucolher_google_login_return'
