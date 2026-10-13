// O seed não tem createdAt (só animais cadastrados no app têm), então o id
// serve de desempate — ids maiores são sempre os mais recentes
function compareByRecency(a, b) {
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0

  if (timeA !== timeB) return timeB - timeA
  return Number(b.id) - Number(a.id)
}

// A localização dos animais é só cidade/UF: o painel filtra por cidade e não
// há filtro nem ordenação por distância
export function applyMatchPreferences({ pets, filters }) {
  const filtered = pets.filter((pet) => !filters.city || pet.city === filters.city)

  if (filters.sort === 'RECENT') {
    return [...filtered].sort(compareByRecency)
  }

  // MATCH: o deck já chega da API ordenado pelo score; reordenar aqui só
  // desfaria esse trabalho
  return filtered
}
