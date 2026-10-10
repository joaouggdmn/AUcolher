import { FaKitMedical, FaBowlFood, FaHouseChimneyUser, FaHandHoldingHeart } from 'react-icons/fa6'

export const CATEGORIA_OPTIONS = [
  { value: 'HEALTH', label: 'Saúde / Cirurgias' },
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'INFRASTRUCTURE', label: 'Estrutura do abrigo' },
]

export const STATUS_OPTIONS = [
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'QUASE_LA', label: 'Quase batendo a meta' },
  { value: 'META_ATINGIDA', label: 'Meta atingida' },
]

// "Quase lá" = 80% ou mais, sem ter batido a meta ainda
export function matchesStatusFilter(campaign, status) {
  if (status === 'URGENTE') return campaign.isUrgent
  if (status === 'META_ATINGIDA') return campaign.isGoalReached
  return campaign.progress >= 80 && !campaign.isGoalReached
}

// Badge + ícone por categoria (card, detalhe, painel)
const CATEGORIA_META = {
  HEALTH: { label: 'Saúde / Cirurgias', icon: FaKitMedical, className: 'bg-rose-50 text-rose-600' },
  FOOD: { label: 'Alimentação', icon: FaBowlFood, className: 'bg-amber-50 text-amber-700' },
  INFRASTRUCTURE: { label: 'Estrutura do abrigo', icon: FaHouseChimneyUser, className: 'bg-sky-50 text-sky-700' },
}

// Categoria nova no backend antes do frontend não derruba a tela
const FALLBACK_META = { label: 'Campanha', icon: FaHandHoldingHeart, className: 'bg-slate-100 text-slate-600' }

export function getCategoriaMeta(category) {
  return CATEGORIA_META[category] ?? FALLBACK_META
}
