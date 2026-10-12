import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaPaw } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import CityChips from './CityChips'
import PetCard from './PetCard'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { useRankedPets } from '../../hooks/useRankedPets'
import { useBrokenPhotos } from '../../hooks/useBrokenPhotos'
import { plural, uniqueByPhoto } from '../../utils/homePets'

const CARD_COUNT = 4

function getHeaderCopy(isMatchedList, availableCount, cityCount) {
  if (isMatchedList) {
    return {
      eyebrow: 'Calculado para você',
      title: 'Os pets que mais combinam com você',
      subtitle: 'Os primeiros do seu deck no AUmatch.',
    }
  }

  return {
    eyebrow: 'Prefere explorar por conta própria?',
    title: 'Disponíveis para adoção agora',
    subtitle: `${availableCount} ${plural(availableCount, 'pet', 'pets')} em ${cityCount} ${plural(
      cityCount,
      'cidade',
      'cidades'
    )}.`,
  }
}

// Com o quiz feito, a vitrine mostra o começo do deck real (o mesmo ranking
// do /aumatch). Para os demais, os anúncios na ordem do catálogo (os
// recém-cadastrados entram no início)
function BrowsePetsSection({ persona }) {
  const { kind, user } = persona
  const { available, availableCount, cities, cityCount, isLoading } = usePlatformStats()
  const { ranked } = useRankedPets(kind === 'matched' ? user : null, { excludeRequested: true })
  const brokenPhotos = useBrokenPhotos()

  const matchedPets = kind === 'matched' ? ranked.slice(0, CARD_COUNT) : []
  const isMatchedList = matchedPets.length > 0

  const catalogPets = useMemo(() => {
    const pool = available.filter(
      (pet) => pet.photoUrl && !brokenPhotos.has(pet.photoUrl) && (!user || pet.ownerId !== user.id)
    )
    return uniqueByPhoto(pool).slice(0, CARD_COUNT)
  }, [available, brokenPhotos, user])

  const pets = isMatchedList ? matchedPets : catalogPets
  const header = getHeaderCopy(isMatchedList, availableCount, cityCount)

  return (
    <section aria-labelledby="browse-title" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader id="browse-title" {...header} />

          <Link
            to="/animais"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full lg:self-auto bg-emerald-800 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition-colors duration-300 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            {availableCount > 0 ? `Ver todos os ${availableCount} animais` : 'Ver todos os animais'}
            <FaArrowRight
              aria-hidden="true"
              size={12}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </HomeReveal>

        <HomeReveal className="mt-8">
          <CityChips cities={cities} />
        </HomeReveal>

        {isLoading ? (
          // Enquanto a API responde: o espaço dos cards, sem piscar o "nenhum animal"
          <div aria-hidden="true" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: CARD_COUNT }, (_, index) => (
              <div
                key={index}
                className={`h-96 rounded-3xl bg-slate-200/70 motion-safe:animate-pulse ${index > 0 ? 'hidden sm:block' : ''}`}
              />
            ))}
          </div>
        ) : pets.length > 0 ? (
          <HomeReveal delay={100}>
            {/* Mobile: carrossel com snap (rolável pelo teclado); sm+: grade */}
            <ul
              aria-label="Animais disponíveis"
              tabIndex={0}
              className="-mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
            >
              {pets.map((pet) => (
                <li key={pet.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  {isMatchedList ? (
                    <div className="relative h-full pt-4">
                      <span className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-800 px-3 py-1 text-xs font-extrabold text-white ring-4 ring-white">
                        <LuSparkles aria-hidden="true" size={11} className="text-amber-300" />
                        {pet.matchScore}% match
                      </span>
                      <PetCard pet={pet} />
                    </div>
                  ) : (
                    <PetCard pet={pet} />
                  )}
                </li>
              ))}
            </ul>
          </HomeReveal>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-3xl bg-stone-50 px-6 py-12 text-center ring-1 ring-slate-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-slate-100">
              <FaPaw aria-hidden="true" size={18} />
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Nenhum animal disponível no momento. Volte em breve ou confira a lista completa.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default BrowsePetsSection
