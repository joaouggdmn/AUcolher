import { LEVEL_LABELS, TEMPERAMENT_META } from '../../utils/behaviorMeta'

export const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Cachorro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'OTHER', label: 'Outro' },
]

export const SIZE_OPTIONS = [
  { value: 'SMALL', label: 'Pequeno' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
]

export const SEX_OPTIONS = [
  { value: 'MALE', label: 'Macho' },
  { value: 'FEMALE', label: 'Fêmea' },
]

export const AGE_GROUP_OPTIONS = [
  { value: 'PUPPY', label: 'Filhote' },
  { value: 'ADULT', label: 'Adulto' },
  { value: 'SENIOR', label: 'Idoso' },
]

// 🆕 Derivados de behaviorMeta — evita duplicar rótulos entre o filtro e a
// página de detalhes
export const ENERGY_LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }))
export const TEMPERAMENT_OPTIONS = Object.entries(TEMPERAMENT_META).map(([value, meta]) => ({ value, label: meta.label }))

// Cidades reais (do deck do AUmatch ou do backend) viram as opções do
// select, em ordem alfabética. A cidade já escolhida continua na lista mesmo
// que tenha sumido dos dados, para o select não ficar em branco
export function buildCityOptions(cities, selected = '') {
  const unique = new Set(cities.filter(Boolean))
  if (selected) unique.add(selected)
  const sorted = [...unique].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return [{ value: '', label: 'Todas as cidades' }, ...sorted.map((city) => ({ value: city, label: city }))]
}
