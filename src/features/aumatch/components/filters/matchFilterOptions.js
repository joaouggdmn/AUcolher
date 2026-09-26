// Reaproveita as cidades da listagem de animais — os valores precisam ser
// exatamente os mesmos nas duas telas
export { CITY_OPTIONS } from '../../../animais/components/filters/filterOptions'

export const MAX_DISTANCE_KM = 50

export const SORT_OPTIONS = [
  { value: 'MATCH', label: 'Maior compatibilidade (%)' },
  { value: 'DISTANCE', label: 'Mais próximos' },
  { value: 'RECENT', label: 'Recém-cadastrados' },
]

// 🆕 Convivência e nível de energia saíram do painel: o quiz de
// compatibilidade já captura esses dados e eles entram no cálculo do match,
// então repeti-los aqui era filtro redundante
export const INITIAL_MATCH_FILTERS = {
  city: '',
  maxDistance: MAX_DISTANCE_KM,
  sort: 'MATCH',
}
