const ROOT = '/admin'

export const ADMIN_PATHS = {
  overview: ROOT,
  users: `${ROOT}/usuarios`,
  animals: `${ROOT}/animais`,
  campaigns: `${ROOT}/campanhas`,
  events: `${ROOT}/eventos`,
  reports: `${ROOT}/denuncias`,
  // Edição pela moderação (o conteúdo segue em nome do dono)
  userEdit: (id) => `${ROOT}/usuarios/${id}/editar`,
  animalEdit: (id) => `${ROOT}/animais/${id}/editar`,
  eventEdit: (id) => `${ROOT}/eventos/${id}/editar`,
  campaignEdit: (id) => `${ROOT}/campanhas/${id}/editar`,
}
