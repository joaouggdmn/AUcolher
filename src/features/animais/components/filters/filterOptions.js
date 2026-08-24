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
  { value: 'M', label: 'Macho' },
  { value: 'F', label: 'Fêmea' },
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

export const CITY_OPTIONS = [
  { value: '', label: 'Todas as cidades' },
  { value: 'Araranguá', label: 'Araranguá' },
  { value: 'Criciúma', label: 'Criciúma' },
  { value: 'Tubarão', label: 'Tubarão' },
  { value: 'Florianópolis', label: 'Florianópolis' },
  { value: 'Içara', label: 'Içara' },
  { value: 'Sombrio', label: 'Sombrio' },
]