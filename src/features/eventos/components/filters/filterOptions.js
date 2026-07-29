import { FaPaw, FaSyringe, FaBagShopping, FaChalkboardUser } from 'react-icons/fa6'

export const CATEGORIA_OPTIONS = [
  { value: 'FEIRA', label: 'Feira de Adoção' },
  { value: 'SAUDE', label: 'Mutirão de Saúde' },
  { value: 'BAZAR', label: 'Bazar Beneficente' },
  { value: 'WORKSHOP', label: 'Workshop' },
]

export const PERIODO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'HOJE', label: 'Hoje' },
  { value: 'FIM_DE_SEMANA', label: 'Este fim de semana' },
  { value: 'PROXIMOS_30_DIAS', label: 'Próximos 30 dias' },
]

export const CIDADE_OPTIONS = [
  { value: '', label: 'Todas as cidades' },
  { value: 'Araranguá', label: 'Araranguá' },
  { value: 'Criciúma', label: 'Criciúma' },
  { value: 'Tubarão', label: 'Tubarão' },
  { value: 'Içara', label: 'Içara' },
]

// Usado no EventCard para exibir badge + ícone por categoria
export const CATEGORIA_META = {
  FEIRA: { label: 'Feira de Adoção', icon: FaPaw, className: 'bg-emerald-50 text-emerald-700' },
  SAUDE: { label: 'Mutirão de Saúde', icon: FaSyringe, className: 'bg-rose-50 text-rose-600' },
  BAZAR: { label: 'Bazar Beneficente', icon: FaBagShopping, className: 'bg-amber-50 text-amber-700' },
  WORKSHOP: { label: 'Workshop', icon: FaChalkboardUser, className: 'bg-sky-50 text-sky-700' },
}