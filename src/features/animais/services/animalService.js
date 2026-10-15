import * as animaisApi from './animaisApi'
import { buildAgeLabel } from '../utils/ageHelpers'
import { mockHttpError } from '../../../core/services/mock/mockStore'
import { isAccountBanned, isAnimalRemoved } from '../../admin/services/moderationMock'

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

  if (filters.specialNeeds) params.specialNeeds = true
  if (filters.city) params.city = filters.city
  if (filters.state) params.state = filters.state

  return params
}

// 🔴 Moderação no modo mock (USE_MOCK_ADMIN): a API ainda não sabe quem o
// admin baniu nem o que ele removeu, então a fachada esconde esses anúncios.
// Com a moderação no backend, a própria API deixa de devolvê-los
function isOnSite(dto) {
  return !isAccountBanned(dto.owner) && !isAnimalRemoved(dto)
}

// Com a moderação no backend, só o admin recebe esses anúncios: o status
// REMOVED e o `owner.active` vêm da própria API
function moderationOf(dto) {
  if (isAnimalRemoved(dto) || dto.status === 'REMOVED') return 'REMOVED'
  return isAccountBanned(dto.owner) || dto.owner?.active === false ? 'OWNER_BANNED' : null
}

// Removido é definitivo: o dono não edita, não tira do ar nem reativa
function assertNotRemoved(id) {
  if (isAnimalRemoved({ id })) {
    throw mockHttpError(403, 'Este anúncio foi removido pela moderação e não pode mais ser alterado.')
  }
}

// ---------- operações ----------

// Uma página da vitrine. `hasMore` alimenta o botão "Mostrar mais"
export async function listAnimals(options) {
  const data = await animaisApi.listAnimals(toApiFilters(options))
  const onSite = data.content.filter(isOnSite)
  return {
    animals: onSite.map(toFrontendAnimal),
    page: data.page,
    // A API ainda conta os escondidos: desconta os desta página (exato quando
    // a busca cabe numa página só, o caso do TCC)
    totalElements: Math.max(data.totalElements - (data.content.length - onSite.length), 0),
    hasMore: data.page + 1 < data.totalPages,
  }
}

// `moderation`: o anúncio saiu do ar pela moderação ('REMOVED' ou
// 'OWNER_BANNED'). O detalhe mostra "Anúncio indisponível" (o admin ainda
// vê, com um aviso)
export async function getAnimal(id) {
  const dto = await animaisApi.getAnimal(id)
  const moderation = moderationOf(dto)
  const animal = toFrontendAnimal(dto)
  return moderation ? { ...animal, moderation } : animal
}

export async function createAnimal(form, photos) {
  return toFrontendAnimal(await animaisApi.createAnimal(toApiAnimal(form, photos)))
}

export async function updateAnimal(id, form, photos) {
  assertNotRemoved(id)
  return toFrontendAnimal(await animaisApi.updateAnimal(id, toApiAnimal(form, photos)))
}

// AVAILABLE, ADOPTED (definitivo) ou INACTIVE (tirado do ar)
export async function changeAnimalStatus(id, status) {
  assertNotRemoved(id)
  return toFrontendAnimal(await animaisApi.changeAnimalStatus(id, status))
}

// Exclusão lógica: o anúncio vira INACTIVE
export async function deleteAnimal(id) {
  assertNotRemoved(id)
  return animaisApi.deleteAnimal(id)
}

// O dono vê o anúncio removido pela moderação com `status: 'REMOVED'` (no
// backend, um status próprio que ele não consegue trocar)
export async function listMyAnimals() {
  return (await animaisApi.listMyAnimals())
    .map((dto) => (isAnimalRemoved(dto) ? { ...dto, status: 'REMOVED' } : dto))
    .map(toFrontendAnimal)
}

export async function listUserAnimals(userId) {
  return (await animaisApi.listUserAnimals(userId)).filter(isOnSite).map(toFrontendAnimal)
}

export async function listFavorites() {
  return (await animaisApi.listFavorites()).filter(isOnSite).map(toFrontendAnimal)
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
