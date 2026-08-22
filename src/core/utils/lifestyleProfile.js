// Fonte única de verdade para "o usuário já respondeu o quiz de estilo de
// vida?" — consumido pelo useProfileCompletion (barra de %) E pelo AumatchPage
// (decide se pula direto pros cards).
export function hasCompletedLifestyleProfile(user) {
  return !!(
    user?.moradia &&
    user?.rotinaExercicio &&
    user?.tempoSozinho &&
    user?.temCriancasOuPets !== null &&
    user?.temCriancasOuPets !== undefined
  )
}