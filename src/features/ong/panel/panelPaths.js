const ROOT = '/ong/painel'

export const PANEL_PATHS = {
  overview: ROOT,
  animals: `${ROOT}/animais`,
  animalNew: `${ROOT}/animais/novo`,
  animalEdit: (id) => `${ROOT}/animais/${id}/editar`,
  requests: `${ROOT}/pedidos`,
  chats: `${ROOT}/conversas`,
  events: `${ROOT}/eventos`,
  eventNew: `${ROOT}/eventos/novo`,
  eventEdit: (id) => `${ROOT}/eventos/${id}/editar`,
  campaigns: `${ROOT}/campanhas`,
  campaignNew: `${ROOT}/campanhas/nova`,
  campaignEdit: (id) => `${ROOT}/campanhas/${id}/editar`,
  donations: `${ROOT}/doacoes`,
  reviews: `${ROOT}/avaliacoes`,
  profile: `${ROOT}/perfil`,
}
