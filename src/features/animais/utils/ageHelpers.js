export function buildAgeLabel(ageValue, ageUnit) {
  if (!ageValue) return ''
  const unitLabel = ageUnit === 'MESES' ? (ageValue === 1 ? 'mês' : 'meses') : ageValue === 1 ? 'ano' : 'anos'
  return `${ageValue} ${unitLabel}`
}

export function deriveAgeGroup(ageValue, ageUnit) {
  const ageInMonths = ageUnit === 'MESES' ? ageValue : ageValue * 12
  if (ageInMonths < 12) return 'FILHOTE'
  if (ageInMonths < 96) return 'ADULTO'
  return 'IDOSO'
}