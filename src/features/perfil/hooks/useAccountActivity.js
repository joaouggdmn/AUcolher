import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useUserReviews } from '../../avaliacoes/hooks/useUserReviews'
import { useEventAttendance } from '../../eventos/hooks/useEventAttendance'
import { mockEventos } from '../../eventos/data/mockEventos'
import { mockUserDonations } from '../data/mockUserDonations'

const IN_PROGRESS_STATUSES = ['ACCEPTED', 'AWAITING_DELIVERY']

function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Status do anúncio do ponto de vista do dono: "em processo" quando já
// existe um pedido aceito caminhando para a entrega
function deriveListingStatus(animal, requests) {
  if (animal.status === 'ADOTADO') return 'ADOTADO'
  const hasActiveAdoption = requests.some(
    (request) => request.animalId === animal.id && IN_PROGRESS_STATUSES.includes(request.status)
  )
  return hasActiveAdoption ? 'EM_PROCESSO' : 'DISPONIVEL'
}

// Tudo o que as quatro seções inferiores de "Minha conta" mostram, a partir
// das mesmas fontes do perfil público — os números batem entre as páginas.
// 🔴 Com a API real, cada bloco vira uma chamada: /usuarios/{id}/animais,
// /avaliacoes, /adocoes, /doacoes e /eventos
export function useAccountActivity(user) {
  const { animals } = useAnimals()
  const { requests } = useAdoptionRequests()
  const reviews = useUserReviews(user?.id)
  const { attendedIds } = useEventAttendance()
  const isOng = user?.userType === 'ONG'

  const activity = useMemo(() => {
    const userId = user?.id

    const myAnimals = animals
      .filter((animal) => isSameId(animal.ownerId, userId))
      .map((animal) => ({
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

    const today = startOfToday()
    const attendedEvents = mockEventos.filter((event) => attendedIds.includes(String(event.id)))
    const isPast = (event) => new Date(`${event.date}T00:00:00`) < today

    const events = {
      upcoming: attendedEvents.filter((event) => !isPast(event)).sort((a, b) => a.date.localeCompare(b.date)),
      past: attendedEvents.filter(isPast).sort((a, b) => b.date.localeCompare(a.date)),
    }

    return { animals: myAnimals, impact, events }
  }, [user?.id, isOng, animals, requests, attendedIds])

  return { ...activity, reviews }
}
