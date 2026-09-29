// Perfil que o visitante vê antes de mexer em qualquer resposta. Foi
// escolhido por dar uma distribuição crível de scores no seed (o melhor
// match fica abaixo de 100%) — um "100%" logo de cara soaria como número
// inventado. Os valores são exatamente os do quizQuestions
export const EXAMPLE_PROFILE = {
  moradia: 'APARTAMENTO',
  rotinaExercicio: 'ATIVO',
  tempoForaCasa: 'PERIODO_NORMAL',
  temCriancasOuPets: false,
  idealPetProfile: 'PLAYFUL_ACTIVE',
  speciesPreference: 'BOTH',
}

// Perguntas do quiz que entram no simulador: as 5 que pontuam + a espécie
// (filtro). O porte fica de fora porque não mexe no score
export const SIM_KEYS = [
  'moradia',
  'rotinaExercicio',
  'tempoForaCasa',
  'temCriancasOuPets',
  'idealPetProfile',
  'speciesPreference',
]

export function isAnswered(value) {
  return value !== undefined && value !== null && value !== ''
}
