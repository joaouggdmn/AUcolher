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

const TIME_AWAY_TO_INDEPENDENCE_RULES = [
  ['LOW', ['POUCO_TEMPO']],
  ['HIGH', ['LONGO_PERIODO']],
  ['MODERATE', ['PERIODO_NORMAL']],
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

// Rótulos usados só nas explicações do "Por que deu match?" — o cálculo
// em si continua trabalhando com os enums canônicos
const ENERGY_WORDS = { LOW: 'baixa', MODERATE: 'moderada', HIGH: 'alta' }
const INDEPENDENCE_WORDS = { LOW: 'baixa', MODERATE: 'média', HIGH: 'alta' }
const IDEAL_PROFILE_WORDS = {
  CALM_COMPANION: 'companheiro e calmo',
  PLAYFUL_ACTIVE: 'brincalhão e ativo',
  PROTECTIVE_INDEPENDENT: 'protetor e independente',
}

// ─────────────────────────────────────────────────────────────
// Fonte única dos critérios: computeMatchScore soma os pontos e
// explainMatchScore mostra o porquê. Qualquer ajuste de peso ou de regra
// acontece aqui uma vez só — os dois lados nunca saem de sincronia.
// ─────────────────────────────────────────────────────────────
export function buildMatchCriteria(user, pet) {
  if (!user || !pet) return []

  // Moradia × ambiente do pet — 20 pts
  const housing = resolveCanonical(user.moradia, HOUSING_RULES)
  const petApartmentFriendly = resolveBoolean(pet.apartmentFriendly)
  const housingPoints = housing === 'APARTMENT' ? (petApartmentFriendly ? 20 : 0) : 20

  // Rotina de exercício × energia do pet — 25 pts
  const desiredEnergy = resolveCanonical(user.rotinaExercicio, ROUTINE_TO_ENERGY_RULES)
  const petEnergy = resolveCanonical(pet.energyLevel, LEVEL_RULES)

  // Tempo sozinho × independência do pet — 20 pts
  const desiredIndependence = resolveCanonical(user.tempoForaCasa, TIME_AWAY_TO_INDEPENDENCE_RULES)
  const petIndependence = resolveCanonical(pet.independenceLevel, LEVEL_RULES)

  // Crianças/outros pets em casa × sociabilidade — 15 pts
  const hasKidsOrPets = resolveBoolean(user.temCriancasOuPets)
  const petGoodWithChildren = resolveBoolean(pet.goodWithChildren)
  const livingPoints = hasKidsOrPets ? (petGoodWithChildren ? 15 : 0) : 15

  // Perfil de pet ideal × temperamento real — 20 pts
  const desiredProfile = resolveCanonical(user.idealPetProfile, IDEAL_PROFILE_RULES)
  const petTemperament = resolveCanonical(pet.temperament, TEMPERAMENT_RULES)
  const desiredTemperaments = TEMPERAMENTS_BY_IDEAL_PROFILE[desiredProfile] ?? []

  return [
    {
      key: 'housing',
      label: 'Espaço da sua moradia',
      maxPoints: 20,
      points: housingPoints,
      isAnswered: !!housing,
      detail: !housing
        ? 'Você ainda não informou onde mora — sem restrição de espaço no cálculo.'
        : housing === 'APARTMENT'
          ? petApartmentFriendly
            ? 'Combina com apartamento, exatamente como a sua moradia.'
            : 'Precisa de mais espaço do que um apartamento oferece.'
          : 'Sua casa comporta qualquer porte e nível de energia.',
    },
    {
      key: 'energy',
      label: 'Ritmo do dia a dia',
      maxPoints: 25,
      points: scoreLevelProximity(desiredEnergy, petEnergy, 25),
      isAnswered: !!desiredEnergy,
      detail: !desiredEnergy
        ? 'Responda sobre sua rotina de exercícios para pontuar este item.'
        : !petEnergy
          ? 'Este anúncio não informou o nível de energia do pet.'
          : desiredEnergy === petEnergy
            ? `Energia ${ENERGY_WORDS[petEnergy]}, no mesmo ritmo que você descreveu.`
            : `Energia ${ENERGY_WORDS[petEnergy]} — perto, mas não idêntica à sua rotina.`,
    },
    {
      key: 'independence',
      label: 'Tempo sozinho em casa',
      maxPoints: 20,
      points: scoreLevelProximity(desiredIndependence, petIndependence, 20),
      isAnswered: !!desiredIndependence,
      detail: !desiredIndependence
        ? 'Responda quanto tempo passa fora de casa para pontuar este item.'
        : !petIndependence
          ? 'Este anúncio não informou o nível de independência do pet.'
          : desiredIndependence === petIndependence
            ? `Independência ${INDEPENDENCE_WORDS[petIndependence]}, ideal para o tempo que você informou.`
            : `Independência ${INDEPENDENCE_WORDS[petIndependence]} — exige um pouco mais de atenção que a sua rotina permite.`,
    },
    {
      key: 'living',
      label: 'Convivência em casa',
      maxPoints: 15,
      points: livingPoints,
      isAnswered: hasKidsOrPets !== null,
      detail:
        hasKidsOrPets === null
          ? 'Você ainda não informou se há crianças ou outros pets em casa.'
          : hasKidsOrPets
            ? petGoodWithChildren
              ? 'Sociável: convive bem com crianças e outros animais.'
              : 'Pode não se adaptar à convivência com crianças ou outros pets.'
            : 'Sem crianças ou outros pets em casa, a convivência não limita a escolha.',
    },
    {
      key: 'temperament',
      label: 'Temperamento desejado',
      maxPoints: 20,
      points: desiredTemperaments.includes(petTemperament) ? 20 : 0,
      isAnswered: !!desiredProfile,
      detail: !desiredProfile
        ? 'Responda qual o seu pet ideal para pontuar este item.'
        : desiredTemperaments.includes(petTemperament)
          ? `É o perfil ${IDEAL_PROFILE_WORDS[desiredProfile]} que você procura.`
          : `O temperamento não é o perfil ${IDEAL_PROFILE_WORDS[desiredProfile]} que você marcou.`,
    },
  ]
}

export function computeMatchScore(user, pet) {
  if (!user || !pet) return 0

  const score = buildMatchCriteria(user, pet).reduce((total, criterion) => total + criterion.points, 0)

  return Math.min(100, Math.max(0, Math.round(score)))
}

// Os critérios mais decisivos primeiro (maior aproveitamento dos pontos),
// que é a ordem em que o modal "Por que deu match?" os lista
export function explainMatchScore(user, pet) {
  const criteria = buildMatchCriteria(user, pet)

  return {
    score: computeMatchScore(user, pet),
    criteria: [...criteria].sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints),
    hasPendingAnswers: criteria.some((criterion) => !criterion.isAnswered),
  }
}

export function sortPetsByMatchScore(user, pets, currentUserId) {
  const eligiblePets = pets.filter((pet) => pet.ownerId !== currentUserId) // 🆕 exclui os próprios animais

  return eligiblePets
    .map((pet) => ({ ...pet, matchScore: computeMatchScore(user, pet) }))
    .sort((a, b) => b.matchScore - a.matchScore)
}
