const ROOT = '/ong/painel'

export const PANEL_PATHS = {
  overview: ROOT,
  animals: `${ROOT}/animais`,
  animalNew: `${ROOT}/animais/novo`,
  animalEdit: (id) => `${ROOT}/animais/${id}/editar`,
  requests: `${ROOT}/pedidos`,
  chats: `${ROOT}/conversas`,
  events: `${ROOT}/eventos`,
  campaigns: `${ROOT}/campanhas`,
  donations: `${ROOT}/doacoes`,
}
