export function buildAgeLabel(ageValue, ageUnit) {
  if (ageValue === '' || ageValue == null) return ''
  // 0 meses é válido (recém-nascido) — `!ageValue` tratava como "sem idade"
  if (Number(ageValue) === 0 && ageUnit === 'MONTHS') return 'Menos de 1 mês'
  const unitLabel = ageUnit === 'MONTHS' ? (ageValue === 1 ? 'mês' : 'meses') : ageValue === 1 ? 'ano' : 'anos'
  return `${ageValue} ${unitLabel}`
}

export function deriveAgeGroup(ageValue, ageUnit) {
  const ageInMonths = ageUnit === 'MONTHS' ? ageValue : ageValue * 12
  if (ageInMonths < 12) return 'PUPPY'
  if (ageInMonths < 96) return 'ADULT'
  return 'SENIOR'
}

// Mesma regra da API: filhotes em meses (0 a 11), os demais em anos (1 a 30)
export const AGE_RULE_HINT = 'De 0 a 11 meses ou de 1 a 30 anos'

export function isValidAge(ageValue, ageUnit) {
  if (ageValue === '' || ageValue == null) return false
  const age = Number(ageValue)
  if (!Number.isInteger(age)) return false
  return ageUnit === 'MONTHS' ? age >= 0 && age <= 11 : age >= 1 && age <= 30
}
