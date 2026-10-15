import {
  FaBan,
  FaBullhorn,
  FaCircleCheck,
  FaClock,
  FaComments,
  FaHandHoldingHeart,
  FaRotateLeft,
  FaXmark,
} from 'react-icons/fa6'

// Adoções que aconteceram: a concluída e as que depois voltaram ao doador ou
// foram repassadas pelo adotante (regras §3.3). Avaliações, contagem de
// adoções e o histórico tratam as três igual
export const ADOPTION_HAPPENED_STATUSES = ['CONCLUDED', 'RETURNED', 'REHOMED']
export const RETURN_STATUSES = ['RETURNED', 'REHOMED']

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
  RETURNED: {
    label: 'Devolvido ao doador',
    description: 'O animal voltou para quem doou.',
    icon: FaRotateLeft,
    tone: 'sky',
  },
  REHOMED: {
    label: 'Republicado por você',
    description: 'Você anunciou o animal para uma nova adoção.',
    icon: FaBullhorn,
    tone: 'sky',
  },
}

// Motivos do retorno e do repasse (returnReason), na ordem do formulário
export const RETURN_REASON_OPTIONS = [
  { value: 'BEHAVIOR', label: 'Comportamento do animal' },
  { value: 'OTHER_PETS', label: 'Incompatibilidade com outros animais da casa' },
  { value: 'CHILDREN', label: 'Incompatibilidade com crianças' },
  { value: 'HOUSING_OR_ROUTINE', label: 'Mudança de moradia ou de rotina' },
  { value: 'COSTS', label: 'Custos' },
  { value: 'ANIMAL_HEALTH', label: 'Saúde do animal' },
  { value: 'OTHER', label: 'Outro motivo' },
]

export const RETURN_REASON_LABELS = Object.fromEntries(RETURN_REASON_OPTIONS.map(({ value, label }) => [value, label]))

export const RETURN_NOTE_MAX_LENGTH = 500

// Adoção feita por ONG é resgate: não tem retorno nem repasse e fica fora
// da taxa de reabandono (regras §3.3)
export function canHaveReturn(request) {
  return !request.adopter?.isOng
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
  sky: 'bg-sky-50 text-sky-700',
}
