// ─────────────────────────────────────────────────────────────
// Normalização defensiva: aceita tanto os valores enum que o quiz
// e o seed de animais realmente salvam (ex: 'SEDENTARIO', 'PLAYFUL')
// quanto eventuais rótulos em português, com ou sem acento (ex:
// 'Sedentário', 'Brincalhão') — protege o cálculo contra qualquer
// divergência entre o que é exibido na UI e o que é persistido.
// ─────────────────────────────────────────────────────────────

function normalizeToken(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos (á, ã, ó, í...)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')     // espaços, barras, hífens → underscore
    .replace(/^_+|_+$/g, '')
}

function resolveCanonical(rawValue, rules) {
  const token = normalizeToken(rawValue)
  if (!token) return null
  for (const [canonical, patterns] of rules) {
    if (patterns.some((pattern) => token.includes(pattern))) return canonical
  }
  return null
}

function resolveBoolean(rawValue) {
  if (typeof rawValue === 'boolean') return rawValue
  const token = normalizeToken(rawValue)
  if (['TRUE', 'SIM', 'YES', '1'].includes(token)) return true
  if (['FALSE', 'NAO', 'NO', '0'].includes(token)) return false
  return null
}

// Ordem importa: padrões mais específicos (ex: MUITO_ATIVO) são checados
// ANTES dos genéricos que são substring deles (ex: ATIVO) — senão
// "Muito ativo" seria capturado incorretamente pela regra de "Ativo"
const HOUSING_RULES = [
  ['APARTMENT', ['APARTAMENTO']],
  ['HOUSE', ['QUINTAL', 'SITIO', 'CHACARA']],
]

const ROUTINE_TO_ENERGY_RULES = [
  ['HIGH', ['MUITO_ATIVO']],
  ['LOW', ['SEDENTARIO']],
  ['MODERATE', ['ATIVO']],
]

const ALONE_TIME_TO_INDEPENDENCE_RULES = [
  ['LOW', ['QUASE_NUNCA']],
  ['HIGH', ['DIA_TODO']],
  ['MODERATE', ['MEIO_PERIODO']],
]

const IDEAL_PROFILE_RULES = [
  ['CALM_COMPANION', ['CALM', 'COMPANHEIRO']],
  ['PLAYFUL_ACTIVE', ['PLAYFUL', 'BRINCALHAO']],
  ['PROTECTIVE_INDEPENDENT', ['PROTECTIVE', 'PROTETOR', 'INDEPENDENT']],
]

// Alinhado com behaviorMeta.js: TEMPERAMENT_META usa as CHAVES em inglês
// (CALM, PLAYFUL, AFFECTIONATE...) mapeadas para rótulos em português —
// os patterns abaixo cobrem os dois formatos por segurança
const TEMPERAMENT_RULES = [
  ['CALM', ['CALM', 'CALMO']],
  ['PLAYFUL', ['PLAYFUL', 'BRINCALHAO']],
  ['AFFECTIONATE', ['AFFECTIONATE', 'AFETUOSO', 'CARINHOSO']],
  ['PROTECTIVE', ['PROTECTIVE', 'PROTETOR']],
  ['INDEPENDENT', ['INDEPENDENT', 'INDEPENDENTE']],
]

const LEVEL_RULES = [
  ['LOW', ['LOW', 'BAIXO']],
  ['MODERATE', ['MODERATE', 'MODERADO']],
  ['HIGH', ['HIGH', 'ALTO']],
]

const TEMPERAMENTS_BY_IDEAL_PROFILE = {
  CALM_COMPANION: ['CALM', 'AFFECTIONATE'],
  PLAYFUL_ACTIVE: ['PLAYFUL'],
  PROTECTIVE_INDEPENDENT: ['PROTECTIVE', 'INDEPENDENT'],
}

const LEVEL_ORDER = ['LOW', 'MODERATE', 'HIGH']

function scoreLevelProximity(levelA, levelB, fullPoints) {
  if (!levelA || !levelB) return 0
  const distance = Math.abs(LEVEL_ORDER.indexOf(levelA) - LEVEL_ORDER.indexOf(levelB))
  if (distance === 0) return fullPoints
  if (distance === 1) return Math.round(fullPoints * 0.4)
  return 0
}

export function computeMatchScore(user, pet) {
  if (!user || !pet) return 0

  let score = 0

  // Moradia × ambiente do pet — 20 pts
  const housing = resolveCanonical(user.moradia, HOUSING_RULES)
  const petApartmentFriendly = resolveBoolean(pet.apartmentFriendly)
  score += housing === 'APARTMENT' ? (petApartmentFriendly ? 20 : 0) : 20

  // Rotina de exercício × energia do pet — 25 pts
  const desiredEnergy = resolveCanonical(user.rotinaExercicio, ROUTINE_TO_ENERGY_RULES)
  const petEnergy = resolveCanonical(pet.energyLevel, LEVEL_RULES)
  score += scoreLevelProximity(desiredEnergy, petEnergy, 25)

  // Tempo sozinho × independência do pet — 20 pts
  const desiredIndependence = resolveCanonical(user.tempoSozinho, ALONE_TIME_TO_INDEPENDENCE_RULES)
  const petIndependence = resolveCanonical(pet.independenceLevel, LEVEL_RULES)
  score += scoreLevelProximity(desiredIndependence, petIndependence, 20)

  // Crianças/outros pets em casa × sociabilidade — 15 pts
  const hasKidsOrPets = resolveBoolean(user.temCriancasOuPets)
  const petGoodWithChildren = resolveBoolean(pet.goodWithChildren)
  score += hasKidsOrPets ? (petGoodWithChildren ? 15 : 0) : 15

  // Perfil de pet ideal × temperamento real — 20 pts
  const desiredProfile = resolveCanonical(user.idealPetProfile, IDEAL_PROFILE_RULES)
  const petTemperament = resolveCanonical(pet.temperament, TEMPERAMENT_RULES)
  const desiredTemperaments = TEMPERAMENTS_BY_IDEAL_PROFILE[desiredProfile] ?? []
  score += desiredTemperaments.includes(petTemperament) ? 20 : 0

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function sortPetsByMatchScore(user, pets, currentUserId) {
  const eligiblePets = pets.filter((pet) => pet.ownerId !== currentUserId) // 🆕 exclui os próprios animais

  return eligiblePets
    .map((pet) => ({ ...pet, matchScore: computeMatchScore(user, pet) }))
    .sort((a, b) => b.matchScore - a.matchScore)
}

