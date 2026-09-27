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
}
