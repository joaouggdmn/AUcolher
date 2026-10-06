export function buildAgeLabel(ageValue, ageUnit) {
  if (!ageValue) return ''
  const unitLabel = ageUnit === 'MONTHS' ? (ageValue === 1 ? 'mês' : 'meses') : ageValue === 1 ? 'ano' : 'anos'
  return `${ageValue} ${unitLabel}`
}

export function deriveAgeGroup(ageValue, ageUnit) {
  const ageInMonths = ageUnit === 'MONTHS' ? ageValue : ageValue * 12
  if (ageInMonths < 12) return 'PUPPY'
  if (ageInMonths < 96) return 'ADULT'
  return 'SENIOR'
}