import { FaPaw, FaSyringe, FaBagShopping, FaChalkboardUser, FaCalendarDays } from 'react-icons/fa6'

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

// Cidades saem dos próprios eventos: qualquer cidade que uma ONG cadastrar
// já aparece no filtro, sem lista fixa para manter
export function buildCidadeOptions(events) {
  const cities = [...new Set(events.map((event) => event.location.city).filter(Boolean))]
  cities.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return [{ value: '', label: 'Todas as cidades' }, ...cities.map((city) => ({ value: city, label: city }))]
}

// Badge + ícone por categoria (card, detalhe, Minha conta)
const CATEGORIA_META = {
  FEIRA: { label: 'Feira de Adoção', icon: FaPaw, className: 'bg-emerald-50 text-emerald-700' },
  SAUDE: { label: 'Mutirão de Saúde', icon: FaSyringe, className: 'bg-rose-50 text-rose-600' },
  BAZAR: { label: 'Bazar Beneficente', icon: FaBagShopping, className: 'bg-amber-50 text-amber-700' },
  WORKSHOP: { label: 'Workshop', icon: FaChalkboardUser, className: 'bg-sky-50 text-sky-700' },
}

// Categoria nova no backend antes do frontend não derruba a tela
const FALLBACK_META = { label: 'Evento', icon: FaCalendarDays, className: 'bg-slate-100 text-slate-600' }

export function getCategoriaMeta(category) {
  return CATEGORIA_META[category] ?? FALLBACK_META
}
