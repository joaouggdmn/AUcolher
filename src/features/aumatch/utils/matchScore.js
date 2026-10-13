// ─────────────────────────────────────────────────────────────
// Cópia do algoritmo do backend (MatchScoreCalculator.java): os pesos e as
// regras são os mesmos — mudou lá, muda aqui. O deck do AUmatch e os
// pedidos recebidos já chegam com o score calculado pela API; este arquivo
// serve aos textos do "Por que deu match?" (e à home, enquanto o deck carrega).
//
// Normalização defensiva: aceita tanto os valores enum que o quiz e a API
// realmente salvam (ex: 'SEDENTARIO', 'PLAYFUL') quanto eventuais rótulos em
// português, com ou sem acento (ex: 'Sedentário', 'Brincalhão') — protege o
// cálculo contra qualquer divergência entre o que é exibido na UI e o que é
// persistido (pedidos antigos guardam snapshots de versões anteriores).
// ─────────────────────────────────────────────────────────────

function normalizeToken(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos (á, ã, ó, í...)
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
  ['APARTMENT', ['APARTAMENTO', 'APARTMENT']],
  ['HOUSE', ['QUINTAL', 'SITIO', 'CHACARA', 'HOUSE', 'FARM']],
]

const ROUTINE_TO_ENERGY_RULES = [
  ['HIGH', ['MUITO_ATIVO', 'VERY_ACTIVE']],
  ['LOW', ['SEDENTARIO', 'SEDENTARY']],
  ['MODERATE', ['ATIVO', 'ACTIVE']],
]

const TIME_AWAY_TO_INDEPENDENCE_RULES = [
  ['LOW', ['POUCO_TEMPO', 'SHORT']],
  ['HIGH', ['LONGO_PERIODO', 'LONG']],
  ['MODERATE', ['PERIODO_NORMAL', 'REGULAR']],
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

const SIZE_RULES = [
  ['SMALL', ['PEQUENO', 'SMALL']],
  ['MEDIUM', ['MEDIO', 'MEDIUM']],
  ['LARGE', ['GRANDE', 'LARGE']],
]

const TEMPERAMENTS_BY_IDEAL_PROFILE = {
  CALM_COMPANION: ['CALM', 'AFFECTIONATE'],
  PLAYFUL_ACTIVE: ['PLAYFUL'],
  PROTECTIVE_INDEPENDENT: ['PROTECTIVE', 'INDEPENDENT'],
}

const LEVEL_ORDER = ['LOW', 'MODERATE', 'HIGH']
const SIZE_ORDER = ['SMALL', 'MEDIUM', 'LARGE']

// Pontuação máxima de cada critério — somam 100, como no MatchCriterion.java
const MAX_POINTS = {
  housing: 15,
  energy: 20,
  independence: 20,
  living: 15,
  temperament: 15,
  size: 15,
}

// Nas escalas ordenadas, igual vale o máximo, vizinho 40% e oposto zero
function scoreProximity(order, desired, actual, fullPoints) {
  if (!desired || !actual) return 0
  const distance = Math.abs(order.indexOf(desired) - order.indexOf(actual))
  if (distance === 0) return fullPoints
  if (distance === 1) return Math.round(fullPoints * 0.4)
  return 0
}

// Quem mora com a pessoa: a lista marcada no quiz (['CRIANCAS', 'GATOS'],
// ou ['NINGUEM']). Pedidos antigos guardam o sim/não de antes, que só
// olhava as crianças. null = sem resposta
function resolveHousehold(user) {
  if (Array.isArray(user.convivencia)) {
    if (user.convivencia.length === 0) return null
    return {
      children: user.convivencia.includes('CRIANCAS'),
      dogs: user.convivencia.includes('CAES'),
      cats: user.convivencia.includes('GATOS'),
    }
  }
  const legacy = resolveBoolean(user.temCriancasOuPets)
  return legacy === null ? null : { children: legacy, dogs: false, cats: false }
}

// "crianças, cães e gatos"
function joinWithAnd(words) {
  if (words.length <= 1) return words[0] ?? ''
  return `${words.slice(0, -1).join(', ')} e ${words[words.length - 1]}`
}

// Rótulos usados só nas explicações do "Por que deu match?" — o cálculo
// em si continua trabalhando com os enums canônicos
const ENERGY_WORDS = { LOW: 'baixa', MODERATE: 'moderada', HIGH: 'alta' }
const INDEPENDENCE_WORDS = { LOW: 'baixa', MODERATE: 'média', HIGH: 'alta' }
const SIZE_WORDS = { SMALL: 'pequeno', MEDIUM: 'médio', LARGE: 'grande' }
const IDEAL_PROFILE_WORDS = {
  CALM_COMPANION: 'companheiro e calmo',
  PLAYFUL_ACTIVE: 'brincalhão e ativo',
  PROTECTIVE_INDEPENDENT: 'protetor e independente',
}

function livingDetail(household, groups) {
  if (!household) return 'Você ainda não informou quem mora com você.'
  if (groups.length === 0) return 'Sem crianças ou outros pets em casa, a convivência não limita a escolha.'

  const good = groups.filter((group) => group.isCompatible).map((group) => group.word)
  const bad = groups.filter((group) => !group.isCompatible).map((group) => group.word)
  if (bad.length === 0) return `Convive bem com ${joinWithAnd(good)}, como na sua casa.`
  if (good.length === 0) return `Pode não se adaptar à convivência com ${joinWithAnd(bad)}.`
  return `Convive bem com ${joinWithAnd(good)}, mas não com ${joinWithAnd(bad)}.`
}

function sizeDetail({ preferredSize, desiredSize, petSize }) {
  if (!desiredSize) return 'Responda o porte que você prefere para pontuar este item.'
  if (!petSize) return 'Este anúncio não informou o porte do pet.'
  if (!preferredSize) {
    return petSize === 'SMALL'
      ? 'Porte pequeno, o mais prático para quem mora em apartamento.'
      : `Porte ${SIZE_WORDS[petSize]} — em apartamento, o pequeno costuma ser mais prático.`
  }
  return desiredSize === petSize
    ? `Porte ${SIZE_WORDS[petSize]}, exatamente o que você prefere.`
    : `Porte ${SIZE_WORDS[petSize]} — diferente do ${SIZE_WORDS[desiredSize]} que você prefere.`
}

// ─────────────────────────────────────────────────────────────
// Fonte única dos critérios: computeMatchScore soma os pontos e
// explainMatchScore mostra o porquê. Qualquer ajuste de peso ou de regra
// acontece aqui uma vez só (e no MatchScoreCalculator.java).
// ─────────────────────────────────────────────────────────────
export function buildMatchCriteria(user, pet) {
  if (!user || !pet) return []

  // Moradia × ambiente do pet
  const housing = resolveCanonical(user.moradia, HOUSING_RULES)
  const petApartmentFriendly = resolveBoolean(pet.apartmentFriendly)
  const housingPoints = housing === 'APARTMENT' ? (petApartmentFriendly ? MAX_POINTS.housing : 0) : MAX_POINTS.housing

  // Rotina de exercício × energia do pet
  const desiredEnergy = resolveCanonical(user.rotinaExercicio, ROUTINE_TO_ENERGY_RULES)
  const petEnergy = resolveCanonical(pet.energyLevel, LEVEL_RULES)

  // Tempo fora de casa × independência do pet
  const desiredIndependence = resolveCanonical(user.tempoForaCasa, TIME_AWAY_TO_INDEPENDENCE_RULES)
  const petIndependence = resolveCanonical(pet.independenceLevel, LEVEL_RULES)

  // Quem mora com a pessoa × convivência do pet: cada grupo presente
  // precisa de um pet compatível, e os pontos são proporcionais
  const household = resolveHousehold(user)
  const groups = household
    ? [
        household.children && { word: 'crianças', isCompatible: resolveBoolean(pet.goodWithChildren) === true },
        household.dogs && { word: 'cães', isCompatible: resolveBoolean(pet.goodWithDogs) === true },
        household.cats && { word: 'gatos', isCompatible: resolveBoolean(pet.goodWithCats) === true },
      ].filter(Boolean)
    : []
  const livingPoints = groups.length === 0
    ? MAX_POINTS.living
    : Math.round((MAX_POINTS.living * groups.filter((group) => group.isCompatible).length) / groups.length)

  // Perfil de pet ideal × temperamento real
  const desiredProfile = resolveCanonical(user.idealPetProfile, IDEAL_PROFILE_RULES)
  const petTemperament = resolveCanonical(pet.temperament, TEMPERAMENT_RULES)
  const desiredTemperaments = TEMPERAMENTS_BY_IDEAL_PROFILE[desiredProfile] ?? []

  // Porte preferido × porte do pet. Sem resposta, quem mora em apartamento
  // conta como preferindo pequeno
  const preferredSize = resolveCanonical(user.portePreferido, SIZE_RULES)
  const desiredSize = preferredSize ?? (housing === 'APARTMENT' ? 'SMALL' : null)
  const petSize = resolveCanonical(pet.size, SIZE_RULES)

  return [
    {
      key: 'housing',
      label: 'Espaço da sua moradia',
      maxPoints: MAX_POINTS.housing,
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
      maxPoints: MAX_POINTS.energy,
      points: scoreProximity(LEVEL_ORDER, desiredEnergy, petEnergy, MAX_POINTS.energy),
      isAnswered: !!desiredEnergy,
      detail: !desiredEnergy
        ? 'Responda sobre sua rotina de exercícios para pontuar este item.'
        : !petEnergy
          ? 'Este anúncio não informou o nível de energia do pet.'
          : desiredEnergy === petEnergy
            ? `Energia ${ENERGY_WORDS[petEnergy]}, no mesmo ritmo que você descreveu.`
            : `Energia ${ENERGY_WORDS[petEnergy]} — diferente do ritmo da sua rotina.`,
    },
    {
      key: 'independence',
      label: 'Tempo sozinho em casa',
      maxPoints: MAX_POINTS.independence,
      points: scoreProximity(LEVEL_ORDER, desiredIndependence, petIndependence, MAX_POINTS.independence),
      isAnswered: !!desiredIndependence,
      detail: !desiredIndependence
        ? 'Responda quanto tempo passa fora de casa para pontuar este item.'
        : !petIndependence
          ? 'Este anúncio não informou o nível de independência do pet.'
          : desiredIndependence === petIndependence
            ? `Independência ${INDEPENDENCE_WORDS[petIndependence]}, ideal para o tempo que você informou.`
            : `Independência ${INDEPENDENCE_WORDS[petIndependence]} — não é a ideal para o tempo que você passa fora.`,
    },
    {
      key: 'living',
      label: 'Convivência em casa',
      maxPoints: MAX_POINTS.living,
      points: livingPoints,
      isAnswered: household !== null,
      detail: livingDetail(household, groups),
    },
    {
      key: 'temperament',
      label: 'Temperamento desejado',
      maxPoints: MAX_POINTS.temperament,
      points: desiredTemperaments.includes(petTemperament) ? MAX_POINTS.temperament : 0,
      isAnswered: !!desiredProfile,
      detail: !desiredProfile
        ? 'Responda qual o seu pet ideal para pontuar este item.'
        : desiredTemperaments.includes(petTemperament)
          ? `É o perfil ${IDEAL_PROFILE_WORDS[desiredProfile]} que você procura.`
          : `O temperamento não é o perfil ${IDEAL_PROFILE_WORDS[desiredProfile]} que você marcou.`,
    },
    {
      key: 'size',
      label: 'Porte',
      maxPoints: MAX_POINTS.size,
      points: scoreProximity(SIZE_ORDER, desiredSize, petSize, MAX_POINTS.size),
      isAnswered: !!preferredSize,
      detail: sizeDetail({ preferredSize, desiredSize, petSize }),
    },
  ]
}

export function computeMatchScore(user, pet) {
  if (!user || !pet) return 0

  const score = buildMatchCriteria(user, pet).reduce((total, criterion) => total + criterion.points, 0)

  return Math.min(100, Math.max(0, Math.round(score)))
}

// Os critérios mais decisivos primeiro (maior aproveitamento dos pontos),
// que é a ordem em que o modal "Por que deu match?" os lista. Pet do deck
// traz os pontos calculados pela API (matchCriteria): eles valem, e daqui
// saem só os textos
export function explainMatchScore(user, pet) {
  const criteria = buildMatchCriteria(user, pet).map((criterion) => {
    const fromApi = pet?.matchCriteria?.find((candidate) => candidate.key === criterion.key)
    return fromApi
      ? { ...criterion, points: fromApi.points, maxPoints: fromApi.maxPoints, isAnswered: fromApi.isAnswered }
      : criterion
  })

  return {
    score: pet?.matchScore ?? computeMatchScore(user, pet),
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
