export const IN_PROGRESS_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY']

export const LISTING_STATUS_META = {
  AVAILABLE: { label: 'Disponível', className: 'bg-emerald-50 text-emerald-700' },
  IN_PROGRESS: { label: 'Em processo', className: 'bg-amber-50 text-amber-700' },
  ADOPTED: { label: 'Adotado', className: 'bg-slate-100 text-slate-500' },
  INACTIVE: { label: 'Fora do ar', className: 'bg-slate-100 text-slate-400' },
}

// Status do anúncio do ponto de vista do dono: "em processo" quando já
// existe um pedido aceito caminhando para a entrega
function deriveListingStatus(animal, requests) {
  if (animal.status === 'ADOPTED' || animal.status === 'INACTIVE') return animal.status
  const hasActiveAdoption = requests.some(
    (request) => request.animalId === animal.id && IN_PROGRESS_STATUSES.includes(request.status)
  )
  return hasActiveAdoption ? 'IN_PROGRESS' : 'AVAILABLE'
}

// Animais do dono com `listingStatus` e quantos pedidos esperam resposta
export function withAdoptionStatus(animals, requests) {
  return animals.map((animal) => ({
    ...animal,
    listingStatus: deriveListingStatus(animal, requests),
    pendingInterests: requests.filter((r) => r.animalId === animal.id && r.status === 'PENDING').length,
  }))
}
