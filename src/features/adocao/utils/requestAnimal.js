import { isSameId } from '../../../core/utils/ids'

const MISSING_ANIMAL_NAME = 'Animal não encontrado'

// Foto em data URL (até 300 KB cada) estouraria o localStorage
function httpUrlOrNull(url) {
  return typeof url === 'string' && /^https?:\/\//.test(url) ? url : null
}

// Cópia do animal guardada no pedido, como já acontece com `adopter`.
// `source` diz de onde ele veio: 'api' (página do animal) ou 'legacy'
// (AUmatch, que ainda usa o AnimalContext). Os ids das duas fontes se
// repetem, então só o id não basta para achar o animal
export function buildAnimalSnapshot(animal, source) {
  return {
    source,
    id: animal.id,
    name: animal.name,
    photoUrl: httpUrlOrNull(animal.photoUrl),
    species: animal.species ?? null,
    ownerId: animal.ownerId ?? null,
    ownerName: animal.ownerName || null,
    ownerPhotoUrl: httpUrlOrNull(animal.ownerPhotoUrl),
    organizationName: animal.organizationName ?? null,
  }
}

// Pedido antigo, sem a cópia: é da API se o animal da API com esse id for
// do mesmo dono do pedido
export function requestAnimalSource(request, apiAnimal) {
  if (request.animal?.source) return request.animal.source
  return apiAnimal && isSameId(apiAnimal.ownerId, request.ownerId) ? 'api' : 'legacy'
}

// O animal atual da fonte certa (nome, foto e dados do AUmatch em dia); sem
// ele, a cópia do pedido; sem nenhum dos dois, só o id
export function resolveRequestAnimal(request, { apiAnimal, legacyAnimal }) {
  const live = requestAnimalSource(request, apiAnimal) === 'api' ? apiAnimal : legacyAnimal
  if (live && isSameId(live.ownerId, request.ownerId)) return live
  return { id: request.animalId, name: null, photoUrl: null, ...request.animal }
}

export function animalDisplayName(animal) {
  return animal?.name ?? MISSING_ANIMAL_NAME
}
