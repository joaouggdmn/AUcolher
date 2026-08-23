import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAnimals } from '../context/AnimalContext'
import { useAdoptionRequests } from '../context/AdoptionRequestContext'

// Deriva a lista de "contatos liberados" a partir dos pedidos ACCEPTED.
// Não existe uma tabela de usuários no mock — por isso os dados do doador
// vêm do próprio animal (ownerName/ownerPhotoUrl, capturados no cadastro),
// e os dados do adotante vêm do snapshot salvo no próprio pedido.
export function useChatContacts() {
  const { user } = useAuth()
  const { animals } = useAnimals()
  const { requests } = useAdoptionRequests()

  const contacts = useMemo(() => {
    if (!user) return []

    return requests
      .filter((request) => request.status === 'ACCEPTED')
      .map((request) => {
        const animal = animals.find((a) => a.id === request.animalId)
        const isOwner = request.ownerId === user.id
        const isAdopter = request.adopter?.userId === user.id

        if (!isOwner && !isAdopter) return null // pedido não envolve o usuário atual

        if (isOwner) {
          // Eu sou o doador — o contato é quem demonstrou interesse
          return {
            id: `request-${request.id}`,
            requestId: request.id,
            name: request.adopter.name,
            photoUrl: request.adopter.photoUrl,
            animalName: animal?.name ?? 'Animal',
          }
        }

        // Eu sou o adotante — o contato é o doador do animal
        return {
          id: `request-${request.id}`,
          requestId: request.id,
          name: animal?.ownerName ?? animal?.organizationName ?? 'Doador(a)',
          photoUrl: animal?.ownerPhotoUrl ?? null,
          animalName: animal?.name ?? 'Animal',
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.requestId - a.requestId) // mais recentes primeiro
  }, [user, animals, requests])

  return { contacts }
}