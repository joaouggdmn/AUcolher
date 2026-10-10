import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useChatContacts } from '../../../core/hooks/useChatContacts'
import { useChatUnread } from '../../../core/hooks/useChatUnread'
import { useMyAnimals } from '../../animais/hooks/useAnimais'
import { IN_PROGRESS_STATUSES, withAdoptionStatus } from '../../animais/utils/listingStatus'
import { useMyEvents } from '../../eventos/hooks/useEventos'
import { useMyCampaigns } from '../../doacoes/hooks/useCampanhas'
import { useReceivedDonations } from '../../doacoes/hooks/useDoacoes'

const NO_ITEMS = []

function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

function byDateAsc(a, b) {
  return a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? '')
}

function timeOf(date) {
  return date ? new Date(date).getTime() : 0
}

function countWhere(items, predicate) {
  return items.filter(predicate).length
}

function previewOf(message, userId) {
  if (!message) return null
  if (message.senderId === 'system' || !isSameId(message.senderId, userId)) return message.text
  return `Você: ${message.text}`
}

// Tudo o que o painel da ONG mostra. Animais vêm da API; pedidos e chat,
// do localStorage; eventos, campanhas e doações, dos seus serviços (mock ou API).
// O pedido guarda só o id do animal: os pedidos novos apontam para animais da
// API, os antigos para o AnimalContext — então procura nos dois, API primeiro.
// Animal que não está em nenhum dos dois volta com `name: null`
export function useOngDashboard() {
  const { user } = useAuth()
  const eventsQuery = useMyEvents()
  const campaignsQuery = useMyCampaigns()
  const donationsQuery = useReceivedDonations()
  const animalsQuery = useMyAnimals()
  const { animals: legacyAnimals } = useAnimals()
  const { requests: allRequests } = useAdoptionRequests()
  const { contacts } = useChatContacts()
  const { conversations: chats } = useChatUnread()

  const myEvents = eventsQuery.data ?? NO_ITEMS
  const myCampaigns = campaignsQuery.data ?? NO_ITEMS
  const donations = donationsQuery.data ?? NO_ITEMS
  const apiAnimals = animalsQuery.data ?? NO_ITEMS
  const userId = user?.id

  const data = useMemo(() => {
    const animalsById = new Map([...legacyAnimals, ...apiAnimals].map((animal) => [String(animal.id), animal]))
    const findAnimal = (id) => animalsById.get(String(id)) ?? { id, name: null, photoUrl: null }

    const requests = allRequests
      .filter((request) => isSameId(request.ownerId, userId))
      .map((request) => ({ ...request, animal: findAnimal(request.animalId) }))
      .sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt))

    const animals = withAdoptionStatus(apiAnimals, requests)

    // Só as conversas com quem quer adotar os animais da ONG
    const conversations = contacts
      .filter((contact) => contact.isOwnerView)
      .map((contact) => {
        const chat = chats[contact.requestId]
        return {
          ...contact,
          animalName: findAnimal(contact.animalId).name ?? 'Animal não encontrado',
          unread: chat?.unread ?? 0,
          lastMessageText: previewOf(chat?.lastMessage, userId),
          lastMessageAt: chat?.lastMessage?.timestamp ?? null,
        }
      })
      .sort((a, b) => timeOf(b.lastMessageAt) - timeOf(a.lastMessageAt) || b.requestId - a.requestId)

    const events = {
      upcoming: myEvents.filter((event) => !event.isPast).sort(byDateAsc),
      past: myEvents.filter((event) => event.isPast).sort((a, b) => byDateAsc(b, a)),
    }

    // A API já manda da mais nova para a mais antiga
    const campaigns = {
      active: myCampaigns.filter((campaign) => !campaign.isClosed),
      closed: myCampaigns.filter((campaign) => campaign.isClosed),
    }

    const timeline = [
      ...animals.map((animal) => ({ id: `animal-${animal.id}`, type: 'ANIMAL', animal, date: animal.createdAt })),
      ...requests.map((request) => ({ id: `pedido-${request.id}`, type: 'PEDIDO', request, date: request.createdAt })),
      ...requests
        .filter((request) => request.status === 'CONCLUDED')
        .map((request) => ({ id: `adocao-${request.id}`, type: 'ADOCAO', request, date: request.concludedAt })),
      ...donations.map((donation) => ({ id: `doacao-${donation.id}`, type: 'DOACAO', donation, date: donation.approvedAt })),
      ...myEvents.map((event) => ({ id: `evento-${event.id}`, type: 'EVENTO', event, date: event.createdAt })),
      ...myCampaigns.map((campaign) => ({ id: `campanha-${campaign.id}`, type: 'CAMPANHA', campaign, date: campaign.createdAt })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => timeOf(b.date) - timeOf(a.date))

    const stats = {
      animalsTotal: animals.length,
      animalsAvailable: countWhere(animals, (animal) => animal.listingStatus === 'AVAILABLE'),
      animalsInProgress: countWhere(animals, (animal) => animal.listingStatus === 'IN_PROGRESS'),
      pendingRequests: countWhere(requests, (request) => request.status === 'PENDING'),
      adoptionsInProgress: countWhere(requests, (request) => IN_PROGRESS_STATUSES.includes(request.status)),
      adoptionsConcluded: countWhere(requests, (request) => request.status === 'CONCLUDED'),
      conversations: conversations.length,
      unreadMessages: conversations.reduce((sum, conversation) => sum + conversation.unread, 0),
      upcomingEvents: events.upcoming.length,
      nextEvent: events.upcoming[0] ?? null,
      activeCampaigns: campaigns.active.length,
      activeRaised: campaigns.active.reduce((sum, campaign) => sum + campaign.raisedAmount, 0),
      donations: donations.length,
      totalReceived: donations.reduce((sum, donation) => sum + donation.amount, 0),
    }

    return { animals, requests, conversations, events, campaigns, donations, timeline, stats }
  }, [userId, legacyAnimals, apiAnimals, allRequests, contacts, chats, myEvents, myCampaigns, donations])

  return {
    ...data,
    queries: { events: eventsQuery, campaigns: campaignsQuery, donations: donationsQuery, animals: animalsQuery },
  }
}
