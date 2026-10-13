// Respostas do quiz: quase todas são um valor só; a de múltipla escolha
// ("Quem mora com você?", `multiple: true`) é a lista do que foi marcado.
// O OnboardingQuiz e o LifestyleForm ("Minha conta") usam estas funções,
// assim as duas telas tratam as perguntas do mesmo jeito

// Vazio, nulo ou lista sem nada marcado = pergunta sem resposta
export function isAnswered(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null && value !== ''
}

export function isOptionSelected(question, answer, optionValue) {
  return question.multiple ? Array.isArray(answer) && answer.includes(optionValue) : answer === optionValue
}

// Marca ou desmarca uma opção de pergunta múltipla. A opção exclusiva
// ("Ninguém") desmarca as outras, e marcar outra desmarca ela. A lista sai
// sempre na ordem das opções
function toggleOption(question, answer, optionValue) {
  const current = Array.isArray(answer) ? answer : []
  if (current.includes(optionValue)) return current.filter((value) => value !== optionValue)

  const option = question.options.find((candidate) => candidate.value === optionValue)
  const kept = option?.exclusive
    ? []
    : current.filter((value) => !question.options.some((candidate) => candidate.exclusive && candidate.value === value))

  return question.options.map((candidate) => candidate.value).filter((value) => value === optionValue || kept.includes(value))
}

// Resposta depois de um clique: troca o valor (escolha única) ou alterna a opção (múltipla)
export function nextAnswer(question, answer, optionValue) {
  return question.multiple ? toggleOption(question, answer, optionValue) : optionValue
}

// Rótulos das opções escolhidas, na ordem do quiz
export function selectedLabels(question, answer) {
  return question.options.filter((option) => isOptionSelected(question, answer, option.value)).map((option) => option.label)
}
