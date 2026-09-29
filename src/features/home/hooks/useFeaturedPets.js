import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { computeMatchScore } from '../../aumatch/utils/matchScore'
import { useRankedPets } from './useRankedPets'
import { useBrokenPhotos } from './useBrokenPhotos'
import { uniqueByPhoto } from '../utils/homePets'

const FEATURED_COUNT = 3

// Os pets do card do hero, num lugar só — a vitrine de "Disponíveis" usa o
// mesmo resultado para não repetir logo abaixo quem já apareceu no topo.
// - matched: o deck real (respostas salvas); editar o simulador não mexe aqui
// - visitor/pending: acompanha o simulador (exemplo ou respostas + exemplo)
// - ong: os próprios anúncios, pontuados com o perfil de teste do simulador
export function useFeaturedPets(persona, sim) {
  const { kind, user } = persona
  const { animals } = useAnimals()
  const brokenPhotos = useBrokenPhotos()

  const profile = kind === 'matched' ? user : sim.profile
  const { ranked, eligibleCount } = useRankedPets(profile, {
    excludeRequested: kind === 'matched' || kind === 'pending',
  })

  const ownPets = useMemo(() => {
    if (kind !== 'ong' || !user) return []

    const own = animals.filter(
      (pet) =>
        pet.ownerId === user.id && pet.status !== 'ADOTADO' && pet.photoUrl && !brokenPhotos.has(pet.photoUrl)
    )
    return uniqueByPhoto(own)
      .map((pet) => ({ ...pet, matchScore: computeMatchScore(profile, pet) }))
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [kind, user, animals, profile, brokenPhotos])

  const pets = useMemo(() => {
    if (kind !== 'ong') return ranked.slice(0, FEATURED_COUNT)
    // ONG sem anúncios ainda vê como um card de ONG verificada se apresenta
    const pool = ownPets.length > 0 ? ownPets : ranked.filter((pet) => pet.listingType === 'NGO')
    return pool.slice(0, FEATURED_COUNT)
  }, [kind, ranked, ownPets])

  return {
    pets,
    profile,
    ranked,
    eligibleCount,
    isOwnShowcase: ownPets.length > 0,
  }
}
