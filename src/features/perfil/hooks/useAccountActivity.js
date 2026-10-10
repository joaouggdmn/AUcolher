import { useMemo } from 'react'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { isSameId } from '../../../core/utils/ids'
import { useUserReviews } from '../../avaliacoes/hooks/useUserReviews'
import { useMyAttendance } from '../../eventos/hooks/useEventos'
import { useMyDonations } from '../../doacoes/hooks/useDoacoes'
import { useMyAnimals } from '../../animais/hooks/useAnimais'
import { IN_PROGRESS_STATUSES, withAdoptionStatus } from '../../animais/utils/listingStatus'

const NO_EVENTS = []
const NO_DONATIONS = []

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')
}

// Tudo o que as quatro seções inferiores de "Minha conta" mostram, a partir
// das mesmas fontes do perfil público — os números batem entre as páginas.
// Os animais já vêm da API (GET /animals/mine, em qualquer status); eventos e
// doações, dos seus serviços (mock ou API, ver USE_MOCK_EVENTOS/_CAMPANHAS).
// 🔴 Com a API real, os outros blocos viram uma chamada cada: /avaliacoes e
// /adocoes
export function useAccountActivity(user) {
  const { data: myApiAnimals = [] } = useMyAnimals()
  const { requests } = useAdoptionRequests()
  const reviews = useUserReviews(user?.id)
  const { data: attendedEvents = NO_EVENTS } = useMyAttendance()
  const { data: myDonations = NO_DONATIONS } = useMyDonations()

  const activity = useMemo(() => {
    const userId = user?.id

    const myAnimals = withAdoptionStatus(myApiAnimals, requests)

    const myRequests = requests.filter(
      (request) => isSameId(request.ownerId, userId) || isSameId(request.adopter?.userId, userId)
    )

    const adoptions = myRequests
      .filter((request) => request.status === 'CONCLUDED')
      .map((request) => {
        const { animal } = request
        const animalName = animal.name ?? 'um animal'
        const gaveAway = isSameId(request.ownerId, userId)

        return {
          id: `adocao-${request.id}`,
          type: gaveAway ? 'ADOCAO_DOADA' : 'ADOCAO_RECEBIDA',
          title: gaveAway ? `${animalName} ganhou um novo lar` : `Você adotou ${animalName}`,
          subtitle: gaveAway
            ? `Adotado por ${request.adopter?.name ?? 'outra pessoa'}`
            : `Doado por ${animal.organizationName || animal.ownerName || 'outra pessoa'}`,
          date: request.concludedAt ?? request.createdAt,
        }
      })

    // Só doações pagas entram no impacto; PIX expirado/cancelado não conta.
    // ONG também doa (para campanhas de outras ONGs)
    const donations = myDonations
      .filter((donation) => donation.status === 'APPROVED')
      .map((donation) => ({
        id: `doacao-${donation.id}`,
        type: 'DOACAO',
        title: donation.campaign.title,
        subtitle: donation.campaign.isRemoved
          ? `${donation.campaign.ngoName} · campanha encerrada pela ONG`
          : donation.campaign.ngoName,
        amount: donation.amount,
        date: donation.approvedAt ?? donation.createdAt,
      }))

    const impact = {
      adoptionsCount: adoptions.length,
      inProgressCount: myRequests.filter((request) => IN_PROGRESS_STATUSES.includes(request.status)).length,
      totalDonated: donations.reduce((sum, donation) => sum + donation.amount, 0),
      timeline: [...adoptions, ...donations].sort((a, b) => new Date(b.date) - new Date(a.date)),
    }

    // Cancelado = a ONG excluiu o evento depois que a pessoa confirmou
    const activeEvents = attendedEvents.filter((event) => event.status !== 'CANCELLED')
    const events = {
      upcoming: activeEvents.filter((event) => !event.isPast).sort(byDateAsc),
      past: activeEvents.filter((event) => event.isPast).sort((a, b) => byDateAsc(b, a)),
      cancelled: attendedEvents.filter((event) => event.status === 'CANCELLED').sort(byDateAsc),
    }

    return { animals: myAnimals, impact, events }
  }, [user?.id, myApiAnimals, requests, attendedEvents, myDonations])

  return { ...activity, reviews }
}
