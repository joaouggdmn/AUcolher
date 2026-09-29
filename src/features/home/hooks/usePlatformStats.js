import { useMemo } from 'react'
import { useAnimals } from '../../../core/context/AnimalContext'
import { quizQuestions } from '../../onboarding/data/quizQuestions'

// Todo número exibido na home sai daqui: contagem real dos anúncios ou fato
// do produto (perguntas do quiz). Nada de
// estatística escrita à mão
export function usePlatformStats() {
  const { animals } = useAnimals()

  return useMemo(() => {
    const available = animals.filter((pet) => pet.status !== 'ADOTADO')

    const ngoCount = new Set(
      available.filter((pet) => pet.listingType === 'NGO' && pet.organizationName).map((pet) => pet.organizationName)
    ).size

    const countByCity = new Map()
    for (const pet of available) {
      if (pet.city) countByCity.set(pet.city, (countByCity.get(pet.city) ?? 0) + 1)
    }
    const cities = [...countByCity]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))

    return {
      available,
      availableCount: available.length,
      ngoCount,
      cities,
      cityCount: cities.length,
      questionCount: quizQuestions.length,
    }
  }, [animals])
}
