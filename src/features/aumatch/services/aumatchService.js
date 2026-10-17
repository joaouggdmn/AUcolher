import * as aumatchApi from './aumatchApi'
import { toFrontendAnimal } from '../../animais/services/animalService'
import { isAccountBanned, isAnimalRemoved } from '../../admin/services/moderationMock'

// Fachada do AUmatch: as telas só conhecem estas funções e o modelo do
// frontend. As respostas do quiz seguem com as chaves e os valores do
// quizQuestions (moradia: 'APARTAMENTO'...); a API usa inglês
// (housing: 'APARTMENT'...). Contrato em docs/contratos-prontos/api-aumatch.md

// ---------- conversão DTO ↔ modelo ----------

// Valor do quiz → valor da API
const HOUSING = { APARTAMENTO: 'APARTMENT', CASA_QUINTAL: 'HOUSE_WITH_YARD', SITIO: 'FARM' }
const EXERCISE_ROUTINE = { SEDENTARIO: 'SEDENTARY', ATIVO: 'ACTIVE', MUITO_ATIVO: 'VERY_ACTIVE' }
const TIME_AWAY = { POUCO_TEMPO: 'SHORT', PERIODO_NORMAL: 'REGULAR', LONGO_PERIODO: 'LONG' }
const PREFERRED_SIZE = { PEQUENO: 'SMALL', MEDIO: 'MEDIUM', GRANDE: 'LARGE' }

const invert = (map) => Object.fromEntries(Object.entries(map).map(([quizValue, apiValue]) => [apiValue, quizValue]))

const HOUSING_FROM_API = invert(HOUSING)
const EXERCISE_ROUTINE_FROM_API = invert(EXERCISE_ROUTINE)
const TIME_AWAY_FROM_API = invert(TIME_AWAY)
const PREFERRED_SIZE_FROM_API = invert(PREFERRED_SIZE)

// "Quem mora com você?": no quiz, a lista do que foi marcado (['NINGUEM']
// sozinho = ninguém); na API, três booleanos que vêm juntos ou não vêm
function toApiHousehold(convivencia) {
  if (!Array.isArray(convivencia) || convivencia.length === 0) {
    return { hasChildren: null, hasDogs: null, hasCats: null }
  }
  return {
    hasChildren: convivencia.includes('CRIANCAS'),
    hasDogs: convivencia.includes('CAES'),
    hasCats: convivencia.includes('GATOS'),
  }
}

function toFrontendHousehold({ hasChildren, hasDogs, hasCats }) {
  if (hasChildren == null) return null
  const marked = [hasChildren && 'CRIANCAS', hasDogs && 'CAES', hasCats && 'GATOS'].filter(Boolean)
  return marked.length > 0 ? marked : ['NINGUEM']
}

// Pergunta sem resposta vira null, como o formulário espera
export function toFrontendMatchProfile(dto) {
  return {
    moradia: HOUSING_FROM_API[dto.housing] ?? null,
    rotinaExercicio: EXERCISE_ROUTINE_FROM_API[dto.exerciseRoutine] ?? null,
    tempoForaCasa: TIME_AWAY_FROM_API[dto.timeAway] ?? null,
    convivencia: toFrontendHousehold(dto),
    speciesPreference: dto.speciesPreference ?? null,
    idealPetProfile: dto.idealPetProfile ?? null,
    portePreferido: PREFERRED_SIZE_FROM_API[dto.preferredSize] ?? null,
  }
}

// Corpo do PUT: as 7 respostas sempre, porque a API substitui o perfil inteiro
export function toApiMatchProfile(answers) {
  return {
    housing: HOUSING[answers.moradia] ?? null,
    exerciseRoutine: EXERCISE_ROUTINE[answers.rotinaExercicio] ?? null,
    timeAway: TIME_AWAY[answers.tempoForaCasa] ?? null,
    ...toApiHousehold(answers.convivencia),
    speciesPreference: answers.speciesPreference || null,
    idealPetProfile: answers.idealPetProfile || null,
    preferredSize: PREFERRED_SIZE[answers.portePreferido] ?? null,
  }
}

// Card do deck: o animal no formato de sempre + o score e os pontos de cada
// critério, no mesmo formato do buildMatchCriteria (key em minúsculas,
// isAnswered) para o "Por que deu match?" ler os dois do mesmo jeito
export function toFrontendMatchCard(dto) {
  return {
    ...toFrontendAnimal(dto.animal),
    matchScore: dto.matchScore,
    matchCriteria: dto.criteria.map((criterion) => ({
      key: criterion.key.toLowerCase(),
      points: criterion.points,
      maxPoints: criterion.maxPoints,
      isAnswered: criterion.answered,
    })),
  }
}

// 🔴 Moderação no modo mock (USE_MOCK_ADMIN): como na vitrine
// (animalService), a fachada esconde anúncios removidos e de contas banidas
function isOnSite(card) {
  return !isAccountBanned(card.animal.owner) && !isAnimalRemoved(card.animal)
}

// ---------- operações ----------

export async function getMatchProfile() {
  return toFrontendMatchProfile(await aumatchApi.getMatchProfile())
}

// Devolve o perfil como o banco guardou, já no formato do quiz
export async function saveMatchProfile(answers) {
  return toFrontendMatchProfile(await aumatchApi.saveMatchProfile(toApiMatchProfile(answers)))
}

export async function getMatchDeck() {
  return (await aumatchApi.getMatchDeck()).filter(isOnSite).map(toFrontendMatchCard)
}
