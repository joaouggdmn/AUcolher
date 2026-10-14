import { FaBan, FaCircleCheck, FaClock, FaComments, FaHandHoldingHeart, FaXmark } from 'react-icons/fa6'

// Etapas de um pedido vistas por quem pediu (Meus interesses e a página do
// animal). `tone` escolhe as cores do selo e do aviso
export const SENT_STATUS_META = {
  PENDING: {
    label: 'Aguardando resposta',
    description: 'O doador ainda vai avaliar o seu pedido.',
    icon: FaClock,
    tone: 'amber',
  },
  ACCEPTED: {
    label: 'Pedido aceito',
    description: 'Combine os detalhes da adoção pelo chat.',
    icon: FaComments,
    tone: 'emerald',
  },
  AWAITING_DELIVERY: {
    label: 'Aguardando entrega',
    description: 'O doador confirmou a entrega. Quando o pet chegar, confirme pelo chat.',
    icon: FaHandHoldingHeart,
    tone: 'amber',
  },
  CONCLUDED: {
    label: 'Adoção concluída',
    description: 'Parabéns pelo novo membro da família!',
    icon: FaCircleCheck,
    tone: 'emerald',
  },
  REJECTED: {
    label: 'Recusado',
    description: 'O doador recusou este pedido.',
    icon: FaXmark,
    tone: 'slate',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: FaBan,
    tone: 'slate',
  },
}

// Por que um pedido enviado foi cancelado. ACCOUNT_BANNED e LISTING_REMOVED
// vêm da moderação (regras §8)
const CANCEL_DESCRIPTIONS = {
  ADOPTER_WITHDREW: () => 'Você cancelou este pedido.',
  OWNER_WITHDREW: () => 'O doador desistiu da adoção.',
  ANIMAL_ADOPTED: (animalName) => `${animalName} foi adotado por outra pessoa.`,
  ANIMAL_UNAVAILABLE: () => 'O anúncio saiu do ar.',
  ACCOUNT_BANNED: () => 'Cancelado pela moderação: uma das contas foi suspensa.',
  LISTING_REMOVED: () => 'Cancelado pela moderação: o anúncio foi removido.',
}

export function sentStatusDescription(request, animalName) {
  if (request.status !== 'CANCELLED') return SENT_STATUS_META[request.status]?.description ?? ''
  return CANCEL_DESCRIPTIONS[request.cancelReason]?.(animalName) ?? 'O pedido foi cancelado.'
}

export const TONE_CLASSES = {
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-500',
}
