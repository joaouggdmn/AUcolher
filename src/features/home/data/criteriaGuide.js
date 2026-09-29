import { FaHouseChimney, FaBolt, FaClock, FaChildren, FaHeart } from 'react-icons/fa6'
import { buildMatchCriteria } from '../../aumatch/utils/matchScore'
import { quizQuestions } from '../../onboarding/data/quizQuestions'
import { COMPATIBILITY_META, LEVEL_FIELD_META } from '../../animais/utils/behaviorMeta'

// Os mesmos ícones do MatchReasonsModal (lá eles não são exportados)
export const CRITERION_ICONS = {
  housing: FaHouseChimney,
  energy: FaBolt,
  independence: FaClock,
  living: FaChildren,
  temperament: FaHeart,
}

// Pontuação parcial "consultada" no algoritmo real, em vez de escrita à
// mão: se alguém mudar os pesos em matchScore.js, a home acompanha sozinha
function probePartialPoints(key, userAnswer, petField) {
  return buildMatchCriteria(userAnswer, petField).find((criterion) => criterion.key === key)?.points ?? 0
}

const ENERGY_PARTIAL = probePartialPoints('energy', { rotinaExercicio: 'ATIVO' }, { energyLevel: 'HIGH' })
const INDEPENDENCE_PARTIAL = probePartialPoints(
  'independence',
  { tempoForaCasa: 'PERIODO_NORMAL' },
  { independenceLevel: 'HIGH' }
)

const questionTitle = (key) => quizQuestions.find((question) => question.key === key)?.title ?? ''

// Rótulo e peso de cada critério vêm do próprio algoritmo (buildMatchCriteria
// com perfis vazios devolve os 5 critérios com label e maxPoints)
const BASE_CRITERIA = buildMatchCriteria({}, {})

const GUIDE = {
  housing: {
    questionKey: 'moradia',
    petFieldLabel: COMPATIBILITY_META.apartmentFriendly.label,
    rule: () => 'Em apartamento, pontua quem vive bem em apartamento. Em casa ou sítio, o espaço não limita: pontuação cheia.',
  },
  energy: {
    questionKey: 'rotinaExercicio',
    petFieldLabel: LEVEL_FIELD_META.energyLevel.label,
    rule: (max) => `Mesmo ritmo: ${max} pts. Um nível de diferença: ${ENERGY_PARTIAL} pts. Ritmos opostos: 0.`,
  },
  independence: {
    questionKey: 'tempoForaCasa',
    petFieldLabel: LEVEL_FIELD_META.independenceLevel.label,
    rule: (max) => `Mesmo nível: ${max} pts. Um nível de diferença: ${INDEPENDENCE_PARTIAL} pts. Opostos: 0.`,
  },
  living: {
    questionKey: 'temCriancasOuPets',
    petFieldLabel: COMPATIBILITY_META.goodWithChildren.label,
    rule: () => 'Com crianças ou pets em casa, pontua quem é sociável. Sem eles, pontuação cheia.',
  },
  temperament: {
    questionKey: 'idealPetProfile',
    petFieldLabel: 'Temperamento',
    rule: () =>
      'Companheiro e calmo combina com pets calmos ou afetuosos; brincalhão e ativo, com brincalhões; protetor e independente, com protetores ou independentes.',
  },
}

// [{ key, label, maxPoints, icon, question, petFieldLabel, rule }] na ordem
// do algoritmo — é o que a seção "Como funciona o match" desenha
export const CRITERIA_GUIDE = BASE_CRITERIA.map(({ key, label, maxPoints }) => ({
  key,
  label,
  maxPoints,
  icon: CRITERION_ICONS[key],
  question: questionTitle(GUIDE[key].questionKey),
  petFieldLabel: GUIDE[key].petFieldLabel,
  rule: GUIDE[key].rule(maxPoints),
}))

export const TOTAL_POINTS = CRITERIA_GUIDE.reduce((total, criterion) => total + criterion.maxPoints, 0)

// O critério de maior peso (hoje, "Ritmo do dia a dia") ganha o destaque
// âmbar — calculado, não fixo, pelo mesmo motivo do probe acima
export const HEAVIEST_CRITERION_KEY = CRITERIA_GUIDE.reduce((heaviest, criterion) =>
  criterion.maxPoints > heaviest.maxPoints ? criterion : heaviest
).key

// Etiqueta curta de cada pergunta do simulador ("Ritmo do dia a dia · 25 pts")
export const CRITERION_BY_QUESTION_KEY = Object.fromEntries(
  CRITERIA_GUIDE.map((criterion) => [GUIDE[criterion.key].questionKey, criterion])
)
