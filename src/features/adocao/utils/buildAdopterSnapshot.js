import { quizQuestions } from '../../onboarding/data/quizQuestions'

function findOptionLabel(questionKey, value) {
  const question = quizQuestions.find((q) => q.key === questionKey)
  return question?.options.find((opt) => opt.value === value)?.label
}

export function buildAdopterSnapshot(user, profileCompletion) {
  const lifestyleParts = [
    findOptionLabel('moradia', user.moradia),
    findOptionLabel('rotinaExercicio', user.rotinaExercicio),
    findOptionLabel('temCriancasOuPets', user.temCriancasOuPets),
  ].filter(Boolean)

  return {
    userId: user.id,
    name: user.name,
    photoUrl: user.photoUrl,
    city: user.cidade || 'Não informado',
    state: user.estado || '--',
    profileCompletion,
    lifestyleSummary: lifestyleParts.length > 0 ? lifestyleParts.join(' · ') : 'Perfil ainda incompleto',
  }
}