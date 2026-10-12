import { useMemo } from 'react'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { sortPetsByMatchScore } from '../../aumatch/utils/matchScore'
import { uniqueByPhoto } from '../utils/homePets'
import { useBrokenPhotos } from './useBrokenPhotos'
import { useHomeAnimals } from './useHomeAnimals'

// Mesmas regras de elegibilidade do deck do /aumatch, sem alterar nada lá:
// só disponíveis (a API já filtra), fora os próprios anúncios e (se pedido) os pets que a pessoa
// já solicitou — um pedido recusado libera o pet de volta
export function useRankedPets(profile, { excludeRequested = false } = {}) {
  const { animals } = useHomeAnimals()
  const { user } = useAuth()
  const { requests } = useAdoptionRequests()
  const brokenPhotos = useBrokenPhotos()

  return useMemo(() => {
    const requestedIds = new Set(
      excludeRequested && user
        ? requests
            .filter((request) => request.adopter?.userId === user.id && request.status !== 'REJECTED')
            .map((request) => request.animalId)
        : []
    )

    const species = profile?.speciesPreference
    const pool = animals.filter(
      (pet) =>
        pet.photoUrl &&
        !requestedIds.has(pet.id) &&
        (!species || species === 'BOTH' || pet.species === species)
    )

    // `?? null`: com undefined, o filtro de "próprios anúncios" do
    // sortPetsByMatchScore descartaria todo pet sem ownerId
    const sorted = sortPetsByMatchScore(profile, pool, user?.id ?? null)

    // A foto quebrada só sai da vitrine: o pet continua contando como
    // elegível, porque no deck do AUmatch ele segue lá
    return {
      ranked: uniqueByPhoto(sorted.filter((pet) => !brokenPhotos.has(pet.photoUrl))),
      eligibleCount: sorted.length,
    }
  }, [animals, user, requests, profile, excludeRequested, brokenPhotos])
}
