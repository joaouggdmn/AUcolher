import * as animaisApi from './animaisApi'
import { buildAgeLabel } from '../utils/ageHelpers'
import { speciesFromSearch } from '../utils/speciesSearch'

// Fachada dos animais: as telas só conhecem estas funções e o modelo do
// frontend. A API já usa os mesmos nomes e valores (DOG, MALE, YEARS...),
// então a conversão só adapta o formato e acrescenta campos calculados

export const PAGE_SIZE = 12

// ---------- conversão DTO ↔ modelo ----------

// Detalhe traz `photos`; card (listagem, favoritos, meus animais) traz só a
// `coverPhoto`. Dono vem aninhado em `owner`, e as telas leem os campos soltos
export function toFrontendAnimal(dto) {
  const images = dto.photos ?? (dto.coverPhoto ? [dto.coverPhoto] : [])
  const isNgo = dto.owner?.userType === 'NGO'

  return {
    ...dto,
    images,
    photoUrl: images[0] ?? null,
    ownerId: dto.owner?.id ?? null,
    ownerName: dto.owner?.name ?? '',
    ownerPhotoUrl: dto.owner?.photoUrl ?? null,
    ownerIsVerified: dto.owner?.isVerified ?? false,
    listingType: isNgo ? 'NGO' : 'USER',
    organizationName: isNgo ? dto.owner.name : undefined,
    ageLabel: buildAgeLabel(dto.ageValue, dto.ageUnit),
  }
}

// Corpo do POST/PUT: só os campos do anúncio. Cidade/UF não vão — a API usa
// as do perfil de quem anuncia
export function toApiAnimal(form, photos) {
  return {
    name: form.name,
    species: form.species,
    breed: form.breed,
    sex: form.sex,
    ageValue: Number(form.ageValue),
    ageUnit: form.ageUnit,
    size: form.size,
    vaccinated: form.vaccinated,
    neutered: form.neutered,
    dewormed: form.dewormed,
    specialNeeds: form.specialNeeds,
    energyLevel: form.energyLevel,
    temperament: form.temperament,
    independenceLevel: form.independenceLevel,
    vocalization: form.vocalization,
    goodWithChildren: form.goodWithChildren,
    goodWithDogs: form.goodWithDogs,
    goodWithCats: form.goodWithCats,
    apartmentFriendly: form.apartmentFriendly,
    summary: form.summary,
    story: form.story,
    photos,
  }
}

// Filtros da tela → query string da API. Os nomes já batem (species, sizes,
// sexes...); vazio não vai, para não filtrar por "nada"
export function toApiFilters({ search = '', filters = {}, page = 0, size = PAGE_SIZE } = {}) {
  const params = { page, size }
  if (search.trim()) params.search = search.trim()

  for (const key of ['species', 'sizes', 'sexes', 'ageGroups', 'energyLevels', 'temperaments']) {
    if (filters[key]?.length) params[key] = filters[key]
  }

  // Buscar "cachorro" ou "gatos" vira o filtro de espécie (a API procura o
  // termo só em nome, raça e cidade). Se a pessoa já marcou outras espécies
  // no filtro, o termo segue como texto e a lista sai vazia, como deve
  const searchedSpecies = speciesFromSearch(search)
  if (searchedSpecies && (!params.species || params.species.includes(searchedSpecies))) {
    delete params.search
    params.species = [searchedSpecies]
  }

  if (filters.specialNeeds) params.specialNeeds = true
  if (filters.city) params.city = filters.city
  if (filters.state) params.state = filters.state

  return params
}

// A moderação é do backend: anúncio removido e de conta banida já não vêm
// para o site. Só o admin recebe esses, com o status REMOVED e o
// `owner.active` da própria API
function moderationOf(dto) {
  if (dto.status === 'REMOVED') return 'REMOVED'
  return dto.owner?.active === false ? 'OWNER_BANNED' : null
}

// ---------- operações ----------

// Uma página da vitrine. `hasMore` alimenta o botão "Mostrar mais"
export async function listAnimals(options) {
  const data = await animaisApi.listAnimals(toApiFilters(options))
  return {
    animals: data.content.map(toFrontendAnimal),
    page: data.page,
    totalElements: data.totalElements,
    hasMore: data.page + 1 < data.totalPages,
  }
}

// `moderation`: o anúncio saiu do ar pela moderação ('REMOVED' ou
// 'OWNER_BANNED'). O detalhe mostra "Anúncio indisponível" (o admin ainda
// vê, com um aviso)
export async function listAnimalCities() {
  return animaisApi.listAnimalCities()
}

export async function getAnimal(id) {
  const dto = await animaisApi.getAnimal(id)
  const moderation = moderationOf(dto)
  const animal = toFrontendAnimal(dto)
  return moderation ? { ...animal, moderation } : animal
}

export async function createAnimal(form, photos) {
  return toFrontendAnimal(await animaisApi.createAnimal(toApiAnimal(form, photos)))
}

// Anúncio removido pela moderação é definitivo: a API recusa (403) editar,
// tirar do ar ou reativar
export async function updateAnimal(id, form, photos) {
  return toFrontendAnimal(await animaisApi.updateAnimal(id, toApiAnimal(form, photos)))
}

// AVAILABLE, ADOPTED (definitivo) ou INACTIVE (tirado do ar)
export async function changeAnimalStatus(id, status) {
  return toFrontendAnimal(await animaisApi.changeAnimalStatus(id, status))
}

// Exclusão lógica: o anúncio vira INACTIVE
export async function deleteAnimal(id) {
  return animaisApi.deleteAnimal(id)
}

// O dono vê o anúncio removido pela moderação com `status: 'REMOVED'`, um
// status próprio que ele não consegue trocar
export async function listMyAnimals() {
  return (await animaisApi.listMyAnimals()).map(toFrontendAnimal)
}

export async function listUserAnimals(userId) {
  return (await animaisApi.listUserAnimals(userId)).map(toFrontendAnimal)
}

export async function listFavorites() {
  return (await animaisApi.listFavorites()).map(toFrontendAnimal)
}

export function listFavoriteIds() {
  return animaisApi.listFavoriteIds()
}

export function addFavorite(animalId) {
  return animaisApi.addFavorite(animalId)
}

export function removeFavorite(animalId) {
  return animaisApi.removeFavorite(animalId)
}
