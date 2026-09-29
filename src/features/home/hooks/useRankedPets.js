import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { sortPetsByMatchScore } from '../../aumatch/utils/matchScore'
import { uniqueByPhoto } from '../utils/homePets'
import { useBrokenPhotos } from './useBrokenPhotos'

// Nenhum ownerId é igual a um Symbol novo: é o "não exclua ninguém" do
// sortPetsByMatchScore, que sempre filtra pelo id recebido
const NO_OWNER = Symbol('sem-dono')

// Mesmas regras de elegibilidade do deck do /aumatch, sem alterar nada lá:
// fora os adotados, os próprios anúncios e (se pedido) os pets que a pessoa
// já solicitou — um pedido recusado libera o pet de volta.
// excludeOwn: false é só para a ONG, que no simulador quer ver em que
// posição os próprios animais aparecem para quem adota
export function useRankedPets(profile, { excludeRequested = false, excludeOwn = true } = {}) {
  const { animals } = useAnimals()
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
        pet.status !== 'ADOTADO' &&
        pet.photoUrl &&
        !requestedIds.has(pet.id) &&
        (!species || species === 'BOTH' || pet.species === species)
    )

    // `?? null`: com undefined, o filtro de "próprios anúncios" do
    // sortPetsByMatchScore descartaria todo pet sem ownerId
    const sorted = sortPetsByMatchScore(profile, pool, excludeOwn ? (user?.id ?? null) : NO_OWNER)

    // A foto quebrada só sai da vitrine: o pet continua contando como
    // elegível, porque no deck do AUmatch ele segue lá
    return {
      ranked: uniqueByPhoto(sorted.filter((pet) => !brokenPhotos.has(pet.photoUrl))),
      eligibleCount: sorted.length,
    }
  }, [animals, user, requests, profile, excludeRequested, excludeOwn, brokenPhotos])
}
