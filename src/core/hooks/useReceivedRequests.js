import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAnimals } from '../context/AnimalContext'
import { useAdoptionRequests } from '../context/AdoptionRequestContext'

export function useReceivedRequests() {
  const { user } = useAuth()
  const { animals } = useAnimals()
  const { requests, acceptRequest, rejectRequest } = useAdoptionRequests()

  const receivedRequests = useMemo(() => {
    if (!user) return []

    return requests
      .filter((request) => request.ownerId === user.id)
      .map((request) => ({
        ...request,
        // animal só existe no AnimalContext desta aba (seed estático ou
        // criado nesta sessão) — fallback evita quebrar se não encontrar
        animal: animals.find((animal) => animal.id === request.animalId) ?? {
          id: request.animalId,
          name: 'Animal',
          photoUrl: null,
        },
      }))
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