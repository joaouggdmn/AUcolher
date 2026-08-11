import { useRef, useState } from 'react'
import { LuSparkles } from 'react-icons/lu'
import PetCardStack from '../components/PetCardStack'
import SwipeActionButtons from '../components/SwipeActionButtons'
import EmptyStackState from '../components/EmptyStackState'
import MatchToast from '../components/MatchToast'
import PetDetailModal from '../components/PetDetailModal'
import { mockPetsAumatch } from '../data/mockPetsAumatch'

function AumatchPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedPet, setMatchedPet] = useState(null)
  const [detailsPet, setDetailsPet] = useState(null)
  const stackRef = useRef(null)

  // 🔴 Quando o backend estiver pronto: const { data: pets = [] } = usePetsParaMatch()
  const pets = mockPetsAumatch
  const visiblePets = pets.slice(currentIndex)
  const topPet = visiblePets[0]

  const handleSwipeLeft = () => setCurrentIndex((i) => i + 1)

  const handleSwipeRight = () => {
    const likedPet = topPet // captura antes de avançar o índice
    setCurrentIndex((i) => i + 1)
    setMatchedPet(likedPet)
    setTimeout(() => setMatchedPet(null), 1800)
  }

  const handleReset = () => setCurrentIndex(0)

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-emerald-50 via-white to-amber-50/40 px-4 pb-16 pt-24 sm:pt-28">
      <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          AUmatch
        </span>
        <h1 className="font-serif text-2xl font-black text-emerald-950 sm:text-3xl">
          Arraste para encontrar seu match
        </h1>
      </div>

      <div className="relative h-[70vh] w-full max-w-md sm:h-[75vh] sm:max-h-[640px]">
        {topPet ? (
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

      <SwipeActionButtons
        onPass={() => stackRef.current?.triggerPass()}
        onLike={() => stackRef.current?.triggerLike()}
        onInfo={() => topPet && setDetailsPet(topPet)}
        isTopOng={topPet?.anunciante === 'ONG'}
        disabled={!topPet}
      />

      <MatchToast pet={matchedPet} />

      {detailsPet && <PetDetailModal pet={detailsPet} onClose={() => setDetailsPet(null)} />}
    </div>
  )
}

export default AumatchPage