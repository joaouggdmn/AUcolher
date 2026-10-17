// A localização dos animais é só cidade/UF: o painel filtra por cidade e não
// há filtro nem ordenação por distância. O deck já chega da API ordenado pelo
// score; reordenar aqui só desfaria esse trabalho
export function applyMatchPreferences({ pets, filters }) {
  return pets.filter((pet) => !filters.city || pet.city === filters.city)
}
