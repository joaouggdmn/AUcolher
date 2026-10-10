import { isSameId } from '../../../core/utils/ids'

export const IN_PROGRESS_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY']

export const LISTING_STATUS_META = {
  AVAILABLE: { label: 'Disponível', className: 'bg-emerald-50 text-emerald-700' },
  IN_PROGRESS: { label: 'Em processo', className: 'bg-amber-50 text-amber-700' },
  ADOPTED: { label: 'Adotado', className: 'bg-slate-100 text-slate-500' },
  INACTIVE: { label: 'Fora do ar', className: 'bg-slate-100 text-slate-400' },
}

// Pedido sobre este animal da API — ids do AnimalContext antigo se repetem
function isRequestFor(request, animal) {
  return (
    request.animalSource === 'api' &&
    isSameId(request.animalId, animal.id) &&
    isSameId(request.ownerId, animal.ownerId)
  )
}

// Status do anúncio do ponto de vista do dono: "em processo" quando já
// existe um pedido aceito caminhando para a entrega. Adoção concluída já
// conta como adotado antes de a API ser atualizada (useSyncAdoptedAnimals)
function deriveListingStatus(animal, statuses) {
  if (animal.status === 'ADOPTED' || statuses.includes('CONCLUDED')) return 'ADOPTED'
  if (animal.status === 'INACTIVE') return 'INACTIVE'
  return statuses.some((status) => IN_PROGRESS_STATUSES.includes(status)) ? 'IN_PROGRESS' : 'AVAILABLE'
}

// Animais do dono com `listingStatus` e quantos pedidos esperam resposta
export function withAdoptionStatus(animals, requests) {
  return animals.map((animal) => {
    const statuses = requests.filter((request) => isRequestFor(request, animal)).map((request) => request.status)
    return {
      ...animal,
      listingStatus: deriveListingStatus(animal, statuses),
      pendingInterests: statuses.filter((status) => status === 'PENDING').length,
    }
  })
}
