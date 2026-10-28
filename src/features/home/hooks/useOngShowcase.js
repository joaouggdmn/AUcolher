import { useMemo } from 'react'
import { useCampaigns } from '../../doacoes/hooks/useCampanhas'
import { useEvents } from '../../eventos/hooks/useEventos'
import { matchesPeriod } from '../../eventos/utils/dateHelpers'
import { useHomeAnimals } from './useHomeAnimals'

// Quantas ONGs a seção da home deixa escolher: as mais ativas
const MAX_SHOWCASE_ONGS = 4

// As mesmas fontes que /campanhas e /eventos usam hoje, juntadas pelo nome
// da ONG. De cada fonte sobram a foto, a cidade e o id da conta. É com o id
// que o card busca o perfil público (banner, link "Ver perfil")
function buildShowcase(animals, campaigns, events) {
  const byName = new Map()
  const entryFor = (name, { id = null, photoUrl = null, city = '', state = '' } = {}) => {
    if (!byName.has(name)) {
      byName.set(name, { name, id: null, photoUrl: null, city: '', state: '', campaigns: [], upcomingEvents: [], petCount: 0 })
    }
    const entry = byName.get(name)
    entry.id ??= id
    entry.photoUrl ??= photoUrl
    if (!entry.city && city) Object.assign(entry, { city, state })
    return entry
  }

  for (const campaign of campaigns) {
    if (campaign.ong?.name) {
      entryFor(campaign.ong.name, campaign.ong).campaigns.push(campaign)
    }
  }

  // matchesPeriod(data, null) já descarta o que passou — o mesmo critério da
  // listagem de eventos. Evento vencido nunca aparece como "próximo"
  for (const event of events) {
    if (event.organizer?.name && matchesPeriod(event.date, null)) {
      entryFor(event.organizer.name, event.organizer).upcomingEvents.push(event)
    }
  }

  for (const pet of animals) {
    if (pet.listingType === 'NGO' && pet.organizationName) {
      entryFor(pet.organizationName, {
        id: pet.ownerId,
        photoUrl: pet.ownerPhotoUrl,
        city: pet.city,
        state: pet.state,
      }).petCount += 1
    }
  }

  return [...byName.values()]
    .map((ong) => ({
      ...ong,
      // Urgentes primeiro: é o que mais precisa de ajuda agora
      campaigns: [...ong.campaigns].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent)),
      upcomingEvents: [...ong.upcomingEvents].sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort(
      (a, b) =>
        b.campaigns.length + b.upcomingEvents.length + b.petCount -
          (a.campaigns.length + a.upcomingEvents.length + a.petCount) || a.name.localeCompare(b.name, 'pt-BR')
    )
    .slice(0, MAX_SHOWCASE_ONGS)
}

// [{ name, id|null, photoUrl, city, state, campaigns, upcomingEvents,
// petCount }], só as MAX_SHOWCASE_ONGS mais ativas, nessa ordem. É o que a
// seção "ONGs parceiras" da home desenha
export function useOngShowcase() {
  const { animals } = useHomeAnimals()
  const { data: campaigns } = useCampaigns()
  const { data: events } = useEvents()

  return useMemo(() => buildShowcase(animals, campaigns ?? [], events ?? []), [animals, campaigns, events])
}
