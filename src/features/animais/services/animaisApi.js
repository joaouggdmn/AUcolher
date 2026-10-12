import api from '../../../core/services/api'

// Chamadas à API de animais e favoritos. Recebem e devolvem os DTOs da API
// sem conversão — quem adapta para o formato das telas é o animalService

// Filtros de múltipla escolha vão repetidos, como o Spring espera:
// ?species=DOG&species=CAT (o padrão do axios seria species[]=DOG)
const repeatArrayParams = { indexes: null }

export async function listAnimals(params) {
  const { data } = await api.get('/animals', { params, paramsSerializer: repeatArrayParams })
  return data
}

export async function getAnimal(id) {
  const { data } = await api.get(`/animals/${id}`)
  return data
}

export async function createAnimal(payload) {
  const { data } = await api.post('/animals', payload)
  return data
}

export async function updateAnimal(id, payload) {
  const { data } = await api.put(`/animals/${id}`, payload)
  return data
}

export async function changeAnimalStatus(id, status) {
  const { data } = await api.patch(`/animals/${id}/status`, { status })
  return data
}

export async function deleteAnimal(id) {
  await api.delete(`/animals/${id}`)
}

// Todos os anúncios da conta logada, em qualquer status
export async function listMyAnimals() {
  const { data } = await api.get('/animals/mine')
  return data
}

// Animais disponíveis de um perfil público
export async function listUserAnimals(userId) {
  const { data } = await api.get(`/users/${userId}/animals`)
  return data
}

export async function listFavorites() {
  const { data } = await api.get('/favorites')
  return data
}

export async function listFavoriteIds() {
  const { data } = await api.get('/favorites/ids')
  return data
}

export async function addFavorite(animalId) {
  await api.put(`/favorites/${animalId}`)
}

export async function removeFavorite(animalId) {
  await api.delete(`/favorites/${animalId}`)
}
