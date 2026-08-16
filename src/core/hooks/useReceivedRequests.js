import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAnimals } from '../context/AnimalContext'
import { useAdoptionRequests } from '../context/AdoptionRequestContext'

// Cruza os 3 contextos para responder "quais pedidos chegaram para os
// animais que EU cadastrei" — nenhum contexto isolado tem essa resposta.
// Fica em core/ (não em features/adocao/) porque o UserAvatarMenu, que
// também consome esse hook para o badge, é um componente core.
export function useReceivedRequests() {
  const { user } = useAuth()
  const { animals } = useAnimals()
  const { requests, acceptRequest, rejectRequest } = useAdoptionRequests()

  const receivedRequests = useMemo(() => {
    if (!user) return []

    const ownedAnimalIds = new Set(
      animals.filter((animal) => animal.ownerId === user.id).map((animal) => animal.id)
    )

    return requests
      .filter((request) => ownedAnimalIds.has(request.animalId))
      .map((request) => ({ ...request, animal: animals.find((animal) => animal.id === request.animalId) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [user, animals, requests])

  const pendingRequests = receivedRequests.filter((r) => r.status === 'PENDING')
  const resolvedRequests = receivedRequests.filter((r) => r.status !== 'PENDING')

  return {
    receivedRequests,
    pendingRequests,
    resolvedRequests,
    pendingCount: pendingRequests.length,
    acceptRequest,
    rejectRequest,
  }
}