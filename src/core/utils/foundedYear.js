// Ano de fundação da ONG — mesmos limites da anotação @AnoFundacao do backend
export const FOUNDED_YEAR_MIN = 1800

export const getCurrentYear = () => new Date().getFullYear()

// Texto do input → número para a API e o perfil. Vazio (ou fora dos limites,
// que o min/max do input já barra no submit) vira null: o campo é opcional
export function parseFoundedYear(value) {
  const year = Number(String(value ?? '').trim())
  return Number.isInteger(year) && year >= FOUNDED_YEAR_MIN && year <= getCurrentYear() ? year : null
}
