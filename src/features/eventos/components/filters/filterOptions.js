import { FaPaw, FaSyringe, FaBagShopping, FaChalkboardUser, FaCalendarDays, FaBoxOpen, FaPersonWalking, FaTag } from 'react-icons/fa6'

export const CATEGORIA_OPTIONS = [
  { value: 'ADOPTION_FAIR', label: 'Feira de Adoção' },
  { value: 'HEALTH', label: 'Mutirão de Saúde' },
  { value: 'BAZAAR', label: 'Bazar Beneficente' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'COLLECTION', label: 'Arrecadação' },
  { value: 'MEETUP', label: 'Passeio e encontro' },
  { value: 'OTHER', label: 'Outro' },
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
  ADOPTION_FAIR: { label: 'Feira de Adoção', icon: FaPaw, className: 'bg-emerald-50 text-emerald-700' },
  HEALTH: { label: 'Mutirão de Saúde', icon: FaSyringe, className: 'bg-rose-50 text-rose-600' },
  BAZAAR: { label: 'Bazar Beneficente', icon: FaBagShopping, className: 'bg-amber-50 text-amber-700' },
  WORKSHOP: { label: 'Workshop', icon: FaChalkboardUser, className: 'bg-sky-50 text-sky-700' },
  COLLECTION: { label: 'Arrecadação', icon: FaBoxOpen, className: 'bg-orange-50 text-orange-700' },
  MEETUP: { label: 'Passeio e encontro', icon: FaPersonWalking, className: 'bg-violet-50 text-violet-700' },
  OTHER: { label: 'Outro', icon: FaTag, className: 'bg-slate-100 text-slate-600' },
}

// Categoria nova no backend antes do frontend não derruba a tela
const FALLBACK_META = { label: 'Evento', icon: FaCalendarDays, className: 'bg-slate-100 text-slate-600' }

// Com "Outro", o selo mostra o nome que a ONG escreveu (customCategory)
export function getCategoriaMeta(category, customCategory = null) {
  const meta = CATEGORIA_META[category] ?? FALLBACK_META
  return category === 'OTHER' && customCategory ? { ...meta, label: customCategory } : meta
}
