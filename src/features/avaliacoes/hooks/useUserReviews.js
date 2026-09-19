import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { mockReviews } from '../data/mockReviews'

// Avaliações feitas no fim do ciclo de adoção: reviews.adopter avalia o
// dono do animal; reviews.owner avalia o adotante
function collectAdoptionReviews(profileId, requests, animals) {
  const id = String(profileId)
  const collected = []

  requests.forEach((request) => {
    if (request.status !== 'CONCLUDED' || !request.reviews) return
    const animalName = animals.find((a) => a.id === request.animalId)?.name ?? null

    const entries = [
      [String(request.ownerId) === id, request.reviews.adopter, 'adopter'],
      [request.adopter?.userId != null && String(request.adopter.userId) === id, request.reviews.owner, 'owner'],
    ]

    entries.forEach(([isTarget, review, authorRole]) => {
      if (!isTarget || !review) return
      collected.push({
        id: `${request.id}-${authorRole}`,
        authorName: review.authorName,
        authorPhotoUrl: review.authorPhotoUrl,
        authorIsOng: review.authorIsOng,
        rating: review.rating,
        comment: review.comment,
        animalName,
        createdAt: review.updatedAt ?? review.createdAt,
      })
    })
  })

  return collected
}

// 🔴 Com a API real, vira uma única chamada: GET /usuarios/{id}/avaliacoes
export function useUserReviews(profileId) {
  const { animals } = useAnimals()
  const { requests } = useAdoptionRequests()

  return useMemo(() => {
    const reviews = [
      ...mockReviews.filter((review) => String(review.targetId) === String(profileId)),
      ...collectAdoptionReviews(profileId, requests, animals),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const count = reviews.length
    const average = count > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => review.rating === stars).length,
    }))

    return { reviews, count, average, distribution }
  }, [profileId, requests, animals])
}
