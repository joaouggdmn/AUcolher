import { calculateDistanceKm } from '../../../core/utils/distance'
import { MAX_DISTANCE_KM } from '../components/filters/matchFilterOptions'

// Distância real (Haversine) quando o perfil do adotante tem coordenadas —
// o quiz de localização salva latitude/longitude. Sem elas, cai para o
// distanceKm estático do mock; null significa "não dá para medir"
export function resolveDistanceKm(user, pet) {
  const liveDistance = calculateDistanceKm(user?.latitude, user?.longitude, pet?.latitude, pet?.longitude)
  if (liveDistance !== null) return liveDistance

  return Number.isFinite(pet?.distanceKm) ? pet.distanceKm : null
}

// nulls last: pet sem distância calculável não desaparece da fila, só vai
// para o fim quando a ordenação é por proximidade
function compareByDistance(a, b) {
  const aValid = Number.isFinite(a)
  const bValid = Number.isFinite(b)

  if (!aValid && !bValid) return 0
  if (!aValid) return 1
  if (!bValid) return -1
  return a - b
}

// O seed não tem createdAt (só animais cadastrados no app têm), então o id
// serve de desempate — ids maiores são sempre os mais recentes
function compareByRecency(a, b) {
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0

  if (timeA !== timeB) return timeB - timeA
  return Number(b.id) - Number(a.id)
}

export function applyMatchPreferences({ pets, user, filters }) {
  const withDistance = pets.map((pet) => ({ ...pet, liveDistanceKm: resolveDistanceKm(user, pet) }))

  const filtered = withDistance.filter((pet) => {
    if (filters.city && pet.city !== filters.city) return false

    // O topo do slider significa "sem limite": senão o deck nasceria
    // recortado sem ninguém ter tocado no filtro. E só corta quando existe
    // distância medida — esconder um pet porque o anúncio não tem
    // coordenadas seria pior do que mostrá-lo.
    const hasDistanceLimit = filters.maxDistance < MAX_DISTANCE_KM
    if (hasDistanceLimit && Number.isFinite(pet.liveDistanceKm) && pet.liveDistanceKm > filters.maxDistance) {
      return false
    }

    return true
  })

  if (filters.sort === 'DISTANCE') {
    return [...filtered].sort((a, b) => compareByDistance(a.liveDistanceKm, b.liveDistanceKm))
  }

  if (filters.sort === 'RECENT') {
    return [...filtered].sort(compareByRecency)
  }

  // MATCH: a lista já chega ordenada por matchScore de sortPetsByMatchScore;
  // reordenar aqui só desfaria esse trabalho
  return filtered
}
