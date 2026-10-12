// Chaves do React Query num lugar só: quem lê e quem invalida montam a
// mesma chave. Tudo de um módulo começa com o mesmo prefixo, então
// invalidar `eventos.all` atualiza listas, detalhes e as chaves "me".
// As chaves "me" levam o userId porque o cache não é limpo no logout
export const queryKeys = {
  eventos: {
    all: ['eventos'],
    list: (filters) => ['eventos', 'list', filters],
    detail: (id) => ['eventos', 'detail', String(id)],
    participants: (id) => ['eventos', 'participants', String(id)],
    mine: (userId) => ['eventos', 'mine', String(userId)],
    myAttendance: (userId) => ['eventos', 'my-attendance', String(userId)],
  },
  campanhas: {
    all: ['campanhas'],
    list: (filters) => ['campanhas', 'list', filters],
    detail: (id) => ['campanhas', 'detail', String(id)],
    mine: (userId) => ['campanhas', 'mine', String(userId)],
  },
  // Separado de campanhas: o polling de uma doação não deve ser derrubado
  // a cada escrita numa campanha (e vice-versa, quem aprova invalida os dois)
  doacoes: {
    all: ['doacoes'],
    detail: (id) => ['doacoes', 'detail', String(id)],
    mine: (userId) => ['doacoes', 'mine', String(userId)],
    received: (userId) => ['doacoes', 'received', String(userId)],
  },
  // Denúncias da conta logada: dizem se já existe uma em análise para o alvo
  denuncias: {
    all: ['denuncias'],
    mine: (userId) => ['denuncias', 'mine', String(userId)],
  },
  // Painel do admin: tudo da plataforma, igual para qualquer conta admin
  admin: {
    all: ['admin'],
    stats: ['admin', 'stats'],
    users: ['admin', 'users'],
    animals: ['admin', 'animals'],
    campaigns: ['admin', 'campaigns'],
    events: ['admin', 'events'],
    reports: ['admin', 'reports'],
  },
  // Prefixos de outros módulos (as chaves completas moram nos hooks deles)
  // que uma decisão de moderação precisa atualizar
  moderated: {
    animals: ['animals'],
    favorites: ['favorites'],
    publicProfile: ['public-profile'],
  },
}
