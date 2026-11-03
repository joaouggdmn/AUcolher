export const TOKEN_STORAGE_KEY = 'aucolher_token'
export const TOKEN_TYPE_STORAGE_KEY = 'aucolher_token_type'
export const USER_STORAGE_KEY = 'aucolher_user'
// O chat antigo, que rodava no navegador: ninguém lê mais, o AuthContext só apaga
export const LEGACY_MOCK_CHAT_STORAGE_KEY = 'aucolher_mock_chat'

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
