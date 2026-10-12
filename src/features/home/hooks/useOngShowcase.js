import { useMemo } from 'react'
import { useCampaigns } from '../../doacoes/hooks/useCampanhas'
import { useEvents } from '../../eventos/hooks/useEventos'
import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'
import { matchesPeriod } from '../../eventos/utils/dateHelpers'
import { useHomeAnimals } from './useHomeAnimals'

// As mesmas fontes que /campanhas e /eventos usam hoje. Os perfis mock só
// trazem o nome da ONG, então é pelo nome que tudo se junta. De cada fonte
// sobram também a foto e a cidade reais: é com elas que a ONG sem perfil
// mock (cadastrada só na API) ganha um cartão completo
function buildShowcase(animals, campaigns, events) {
  const byName = new Map()
  const entryFor = (name, { photoUrl = null, city = '', state = '' } = {}) => {
    if (!byName.has(name)) {
      byName.set(name, { name, photoUrl: null, city: '', state: '', campaigns: [], upcomingEvents: [], petCount: 0 })
    }
    const entry = byName.get(name)
    entry.photoUrl ??= photoUrl
    if (!entry.city && city) Object.assign(entry, { city, state })
    return entry
  }

  for (const campaign of campaigns) {
    if (campaign.ong?.name) entryFor(campaign.ong.name, campaign.ong).campaigns.push(campaign)
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
      profile: mockPublicProfiles.find((profile) => profile.userType === 'ONG' && profile.name === ong.name) ?? null,
    }))
    .sort(
      (a, b) =>
        b.campaigns.length + b.upcomingEvents.length + b.petCount -
          (a.campaigns.length + a.upcomingEvents.length + a.petCount) || a.name.localeCompare(b.name, 'pt-BR')
    )
}

// [{ name, photoUrl, city, state, profile|null, campaigns, upcomingEvents,
// petCount }], ONGs mais
// ativas primeiro — é o que a seção "ONGs parceiras" da home desenha
export function useOngShowcase() {
  const { animals } = useHomeAnimals()
  const { data: campaigns } = useCampaigns()
  const { data: events } = useEvents()

  return useMemo(() => buildShowcase(animals, campaigns ?? [], events ?? []), [animals, campaigns, events])
}
