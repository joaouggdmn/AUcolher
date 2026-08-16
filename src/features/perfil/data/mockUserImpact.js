// features/perfil/data/mockUserImpact.js
import { FaHandHoldingHeart, FaCalendarCheck } from 'react-icons/fa6'

export const mockUserImpact = [
  { id: 1, type: 'DOACAO', title: 'Cirurgia urgente do Rex', subtitle: 'Patinhas Carentes', amount: 50, date: '2026-07-20' },
  { id: 2, type: 'EVENTO', title: 'Mutirão de Castração Gratuita', subtitle: 'ONG Patas Unidas · Araranguá', date: '2026-07-28' },
  { id: 3, type: 'DOACAO', title: 'Ração para 60 animais resgatados', subtitle: 'ONG Patas Unidas', amount: 30, date: '2026-06-15' },
  { id: 4, type: 'EVENTO', title: 'Feira de Adoção de Verão', subtitle: 'Patinhas Carentes · Criciúma', date: '2026-05-02' },
]

export const IMPACT_TYPE_META = {
  DOACAO: { icon: FaHandHoldingHeart, className: 'bg-amber-400 text-emerald-950' },
  EVENTO: { icon: FaCalendarCheck, className: 'bg-emerald-700 text-white' },
}