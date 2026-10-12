import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useCampaigns } from '../../doacoes/hooks/useCampanhas'
import { useEvents } from '../../eventos/hooks/useEventos'
import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'
import { matchesPeriod } from '../../eventos/utils/dateHelpers'

// As mesmas fontes que /campanhas e /eventos usam hoje. Os perfis e os animais
// só trazem o nome da ONG (não o id), então é pelo nome que tudo se junta
function buildShowcase(animals, campaigns, events) {
  const byName = new Map()
  const entryFor = (name) => {
    if (!byName.has(name)) byName.set(name, { name, campaigns: [], upcomingEvents: [], petCount: 0 })
    return byName.get(name)
  }

  for (const campaign of campaigns) {
    if (campaign.ong?.name) entryFor(campaign.ong.name).campaigns.push(campaign)
  }

  // matchesPeriod(data, null) já descarta o que passou — o mesmo critério da
  // listagem de eventos. Evento vencido nunca aparece como "próximo"
  for (const event of events) {
    if (event.organizer?.name && matchesPeriod(event.date, null)) {
      entryFor(event.organizer.name).upcomingEvents.push(event)
    }
  }

  for (const pet of animals) {
    if (pet.listingType === 'NGO' && pet.organizationName && pet.status !== 'ADOTADO') {
      entryFor(pet.organizationName).petCount += 1
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

// [{ name, profile|null, campaigns, upcomingEvents, petCount }], ONGs mais
// ativas primeiro — é o que a seção "ONGs parceiras" da home desenha
export function useOngShowcase() {
  const { animals } = useAnimals()
  const { data: campaigns } = useCampaigns()
  const { data: events } = useEvents()

  return useMemo(() => buildShowcase(animals, campaigns ?? [], events ?? []), [animals, campaigns, events])
}
