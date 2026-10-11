// Busca sem diferenciar acento nem maiúscula ("cafe" acha "Café")
export function normalizeSearch(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// O termo aparece em algum dos campos? Termo vazio aceita tudo
export function matchesSearch(term, ...fields) {
  const normalizedTerm = normalizeSearch(term)
  return !normalizedTerm || fields.some((field) => normalizeSearch(field).includes(normalizedTerm))
}
