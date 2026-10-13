import { quizQuestions } from '../../onboarding/data/quizQuestions'
import { selectedLabels } from '../../onboarding/utils/quizAnswers'

function findQuestion(questionKey) {
  return quizQuestions.find((q) => q.key === questionKey)
}

function findOptionLabel(questionKey, value) {
  return findQuestion(questionKey)?.options.find((opt) => opt.value === value)?.label
}

// "Com crianças e gatos" / "Sem crianças ou pets" — nada se não respondeu
function householdSummary(convivencia) {
  if (!Array.isArray(convivencia) || convivencia.length === 0) return undefined
  if (convivencia.includes('NINGUEM')) return 'Sem crianças ou pets'

  const labels = selectedLabels(findQuestion('convivencia'), convivencia).map((label) => label.toLowerCase())
  const last = labels.pop()
  return `Com ${labels.length > 0 ? `${labels.join(', ')} e ${last}` : last}`
}

export function buildAdopterSnapshot(user, profileCompletion) {
  const lifestyleParts = [
    findOptionLabel('moradia', user.moradia),
    findOptionLabel('rotinaExercicio', user.rotinaExercicio),
    householdSummary(user.convivencia),
  ].filter(Boolean)

  return {
    userId: user.id,
    name: user.name,
    photoUrl: user.photoUrl,
    city: user.city || 'Não informado',
    state: user.state || '--',
    profileCompletion,
    lifestyleSummary: lifestyleParts.length > 0 ? lifestyleParts.join(' · ') : 'Perfil ainda incompleto',

    // 🆕 Campos brutos — sem isso, computeMatchScore() na tela do doador
    // nunca teria dado real para calcular, e caía nos "defaults generosos"
    // do algoritmo (ver explicação acima), sempre inflando o percentual.
    moradia: user.moradia,
    rotinaExercicio: user.rotinaExercicio,
    tempoForaCasa: user.tempoForaCasa,
    convivencia: user.convivencia,
    idealPetProfile: user.idealPetProfile,
    portePreferido: user.portePreferido,
  }
}