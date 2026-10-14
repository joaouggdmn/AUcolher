import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { sortPetsByMatchScore } from '../../aumatch/utils/matchScore'
import { matchDeckQuery } from '../../aumatch/hooks/useAumatchDeck'
import { isSameId } from '../../../core/utils/ids'
import { uniqueByPhoto } from '../utils/homePets'
import { useBrokenPhotos } from './useBrokenPhotos'
import { useHomeAnimals } from './useHomeAnimals'

// Mesmas regras de elegibilidade do deck do /aumatch: só disponíveis, fora
// os próprios anúncios e (se pedido) os pets que a pessoa já solicitou — um
// pedido recusado libera o pet de volta.
// Com `profile` (pessoa que já fez o quiz), a ordem é a do deck da API, a
// mesma do /aumatch. Enquanto ele carrega, o mesmo algoritmo roda aqui sobre
// a vitrine, para a home não abrir vazia
export function useRankedPets(profile, { excludeRequested = false } = {}) {
  const { animals } = useHomeAnimals()
  const { user } = useAuth()
  const { requests } = useAdoptionRequests()
  const brokenPhotos = useBrokenPhotos()
  const usesDeck = !!profile && user?.userType === 'PESSOA'
  const { data: deck } = useQuery({ ...matchDeckQuery(user?.id), enabled: usesDeck })

  return useMemo(() => {
    // Pedidos que impedem um novo: qualquer um que não esteja cancelado
    // (recusado é definitivo) — o mesmo critério do deck da API
    const requestedIds = new Set(
      excludeRequested && user
        ? requests
            .filter((request) => isSameId(request.adopter?.userId, user.id) && request.status !== 'CANCELLED')
            .map((request) => String(request.animalId))
        : []
    )

    let sorted
    if (usesDeck && deck) {
      // A API já tirou os próprios anúncios e as outras espécies, e ordenou
      sorted = deck.filter((pet) => pet.photoUrl && !requestedIds.has(String(pet.id)))
    } else {
      const species = profile?.speciesPreference
      const pool = animals.filter(
        (pet) =>
          pet.photoUrl &&
          !requestedIds.has(String(pet.id)) &&
          (!species || species === 'BOTH' || pet.species === species)
      )

      // `?? null`: com undefined, o filtro de "próprios anúncios" do
      // sortPetsByMatchScore descartaria todo pet sem ownerId
      sorted = sortPetsByMatchScore(profile, pool, user?.id ?? null)
    }

    // A foto quebrada só sai da vitrine: o pet continua contando como
    // elegível, porque no deck do AUmatch ele segue lá
    return {
      ranked: uniqueByPhoto(sorted.filter((pet) => !brokenPhotos.has(pet.photoUrl))),
      eligibleCount: sorted.length,
    }
  }, [animals, deck, usesDeck, user, requests, profile, excludeRequested, brokenPhotos])
}
