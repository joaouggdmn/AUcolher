import { useMemo, useRef, useState } from 'react'
import { LuSparkles } from 'react-icons/lu'
import PetCardStack from '../components/PetCardStack'
import SwipeActionButtons from '../components/SwipeActionButtons'
import EmptyStackState from '../components/EmptyStackState'
import MatchToast from '../components/MatchToast'
import PetDetailModal from '../components/PetDetailModal'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAuth } from '../../../core/context/AuthContext'
import { registerLike, registerPass } from '../services/aumatchService'
import OnboardingQuiz from '../../onboarding/components/OnboardingQuiz'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import { sortPetsByMatchScore } from '../utils/matchScore'

function AumatchPage() {
  const { animals: pets } = useAnimals()
  const { user, updateProfile } = useAuth()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedPet, setMatchedPet] = useState(null)
  const [detailsPet, setDetailsPet] = useState(null)
  const stackRef = useRef(null)

  // Só abre o quiz se faltar alguma resposta no perfil — quem já respondeu
  // (nesta sessão ou numa anterior) cai direto nos cards
  const [isQuizOpen, setIsQuizOpen] = useState(() => !hasCompletedLifestyleQuiz(user))
  const [isPreparingMatches, setIsPreparingMatches] = useState(false)

  // Aplica a resposta de "Qual espécie você procura?" diretamente na
  // pilha de cards — sem isso, a resposta ficaria salva sem efeito prático
  const eligiblePets = useMemo(() => {
  // 1) Filtro RÍGIDO — espécie é excludente
  const speciesFiltered =
    !user?.speciesPreference || user.speciesPreference === 'BOTH'
      ? pets
      : pets.filter((pet) => pet.species === user.speciesPreference)

  // 2) Ranqueamento SUAVE — reordena por compatibilidade, nunca exclui.
  // Antes desta correção, essas respostas eram coletadas e nunca usadas.
  if (!user) return speciesFiltered
  return sortPetsByMatchScore(user, speciesFiltered, user.id)
}, [pets, user])

  const visiblePets = eligiblePets.slice(currentIndex)
  const topPet = visiblePets[0]

  const handleQuizComplete = (answers) => {
    // Persiste de verdade no AuthContext — antes disso, as respostas só
    // eram logadas no console e nunca chegavam a ser reaproveitadas
    updateProfile(answers)

    setIsQuizOpen(false)
    setIsPreparingMatches(true)
    setTimeout(() => setIsPreparingMatches(false), 900)
  }

  const handleSwipeLeft = () => {
    const passedPet = topPet
    setCurrentIndex((i) => i + 1)
    registerPass(passedPet.id).catch((err) => console.error('Falha ao registrar pass:', err))
  }

  const handleSwipeRight = () => {
    const likedPet = topPet
    setCurrentIndex((i) => i + 1)
    setMatchedPet(likedPet)
    setTimeout(() => setMatchedPet(null), 1800)
    registerLike(likedPet.id).catch((err) => console.error('Falha ao registrar like:', err))
  }

  const handleReset = () => setCurrentIndex(0)

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-emerald-950 px-4 pb-16 pt-24 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />

      <div className="relative z-10 mb-6 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
          <LuSparkles size={15} />
          AUmatch
        </span>
        <h1 className="font-serif text-2xl font-black text-white sm:text-3xl">
          Arraste para encontrar seu match
        </h1>
      </div>

      <div className="relative z-10 h-[70vh] w-full max-w-md sm:h-[75vh] sm:max-h-[640px]">
        {isPreparingMatches ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <LuSparkles size={24} />
            </span>
            <p className="text-sm font-semibold text-emerald-100">Calculando seus melhores matches...</p>
          </div>
        ) : topPet ? (
          <PetCardStack
            ref={stackRef}
            pets={visiblePets}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        ) : (
          <EmptyStackState onReset={handleReset} />
        )}
      </div>

      <div className="relative z-10">
        <SwipeActionButtons
          onPass={() => stackRef.current?.triggerPass()}
          onLike={() => stackRef.current?.triggerLike()}
          onInfo={() => topPet && setDetailsPet(topPet)}
          isTopOng={topPet?.listingType === 'NGO'}
          disabled={!topPet || isPreparingMatches}
        />
      </div>

      <MatchToast pet={matchedPet} />

      {detailsPet && <PetDetailModal pet={detailsPet} onClose={() => setDetailsPet(null)} />}

      <OnboardingQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onComplete={handleQuizComplete} />
    </div>
  )
}

export default AumatchPage