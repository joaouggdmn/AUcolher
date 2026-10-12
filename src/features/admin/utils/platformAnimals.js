import { requestAnimalSource } from '../../adocao/utils/requestAnimal'
import { withAdoptionStatus } from '../../animais/utils/listingStatus'

// Situação de cada anúncio do ponto de vista da plataforma, com o mesmo
// critério do adminMock (e da Visão geral): o pedido é de um animal da API
// quando a cópia guardada diz isso ou quando o animal com esse id é do
// mesmo dono do pedido
export function withPlatformAdoptionStatus(animals, requests) {
  const byId = new Map(animals.map((animal) => [String(animal.id), animal]))
  const resolved = requests.map((request) => ({
    ...request,
    animalSource: requestAnimalSource(request, byId.get(String(request.animalId))),
  }))
  return withAdoptionStatus(animals, resolved)
}
