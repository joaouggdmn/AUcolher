import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useUserReviews } from '../../avaliacoes/hooks/useUserReviews'
import { useMyAttendance } from '../../eventos/hooks/useEventos'
import { mockUserDonations } from '../data/mockUserDonations'
import { useMyAnimals } from '../../animais/hooks/useAnimais'

const IN_PROGRESS_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY']
const NO_EVENTS = []

function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')
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

// Tudo o que as quatro seções inferiores de "Minha conta" mostram, a partir
// das mesmas fontes do perfil público — os números batem entre as páginas.
// Os animais já vêm da API (GET /animals/mine, em qualquer status) e os
// eventos do eventoService (mock ou API, ver USE_MOCK_EVENTOS).
// 🔴 Com a API real, os outros blocos viram uma chamada cada: /avaliacoes,
// /adocoes e /doacoes
export function useAccountActivity(user) {
  const { animals } = useAnimals()
  const { data: myApiAnimals = [] } = useMyAnimals()
  const { requests } = useAdoptionRequests()
  const reviews = useUserReviews(user?.id)
  const { data: attendedEvents = NO_EVENTS } = useMyAttendance()
  const isOng = user?.userType === 'ONG'

  const activity = useMemo(() => {
    const userId = user?.id

    const myAnimals = myApiAnimals.map((animal) => ({
      ...animal,
      listingStatus: deriveListingStatus(animal, requests),
      pendingInterests: requests.filter((r) => r.animalId === animal.id && r.status === 'PENDING').length,
    }))

    const myRequests = requests.filter(
      (request) => isSameId(request.ownerId, userId) || isSameId(request.adopter?.userId, userId)
    )

    const adoptions = myRequests
      .filter((request) => request.status === 'CONCLUDED')
      .map((request) => {
        const animal = animals.find((a) => a.id === request.animalId)
        const animalName = animal?.name ?? 'um animal'
        const gaveAway = isSameId(request.ownerId, userId)

        return {
          id: `adocao-${request.id}`,
          type: gaveAway ? 'ADOCAO_DOADA' : 'ADOCAO_RECEBIDA',
          title: gaveAway ? `${animalName} ganhou um novo lar` : `Você adotou ${animalName}`,
          subtitle: gaveAway
            ? `Adotado por ${request.adopter?.name ?? 'outra pessoa'}`
            : `Doado por ${animal?.organizationName ?? animal?.ownerName ?? 'outra pessoa'}`,
          date: request.concludedAt ?? request.createdAt,
        }
      })

    // ONG recebe doações pelas campanhas, não doa — o histórico dela é de adoções
    const donations = isOng ? [] : mockUserDonations.map((donation) => ({ ...donation, type: 'DOACAO' }))

    const impact = {
      adoptionsCount: adoptions.length,
      inProgressCount: myRequests.filter((request) => IN_PROGRESS_STATUSES.includes(request.status)).length,
      totalDonated: donations.reduce((sum, donation) => sum + donation.amount, 0),
      timeline: [...adoptions, ...donations].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }

    // Cancelado = a ONG excluiu o evento depois que a pessoa confirmou
    const activeEvents = attendedEvents.filter((event) => event.status !== 'CANCELADO')
    const events = {
      upcoming: activeEvents.filter((event) => !event.isPast).sort(byDateAsc),
      past: activeEvents.filter((event) => event.isPast).sort((a, b) => byDateAsc(b, a)),
      cancelled: attendedEvents.filter((event) => event.status === 'CANCELADO').sort(byDateAsc),
    }

    return { animals: myAnimals, impact, events }
  }, [user?.id, isOng, animals, myApiAnimals, requests, attendedEvents])

  return { ...activity, reviews }
}
