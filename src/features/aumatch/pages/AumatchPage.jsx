import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import { FaSliders } from 'react-icons/fa6'
import PetCardStack from '../components/PetCardStack'
import SwipeActionButtons from '../components/SwipeActionButtons'
import EmptyStackState from '../components/EmptyStackState'
import MatchToast from '../components/MatchToast'
import PetDetailModal from '../components/PetDetailModal'
import MatchReasonsModal from '../components/MatchReasonsModal'
import MatchPreferencesSidebar from '../components/filters/MatchPreferencesSidebar'
import MatchPreferencesDrawer from '../components/filters/MatchPreferencesDrawer'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import { buildAdopterSnapshot } from '../../adocao/utils/buildAdopterSnapshot'
import { registerPass } from '../services/aumatchService'
import { sortPetsByMatchScore } from '../utils/matchScore'
import { applyMatchPreferences } from '../utils/matchFilters'
import { useMatchPreferences } from '../hooks/useMatchPreferences'
import OnboardingQuiz from '../../onboarding/components/OnboardingQuiz'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'

function AumatchPage() {
  const { animals: pets } = useAnimals()
  const { user, isAuthenticated, updateProfile } = useAuth()
  const { requests, createRequest } = useAdoptionRequests()
  const { percentage: profileCompletion } = useProfileCompletion(user)
  const navigate = useNavigate()
  const location = useLocation()

  // 🆕 Set de IDs "resolvidos" nesta sessão (curtidos ou passados), não um
  // índice numérico. Isso é o que evita o bug do "pulo silencioso":
  // eligiblePets pode encolher a qualquer momento (assim que um like vira
  // pedido, o próprio pet curtido some da lista) — com um índice fixo,
  // isso saltaria o próximo pet sem nunca mostrá-lo. Filtrar por
  // identidade (Set.has) é imune a essa mudança de tamanho.
  const [swipedIds, setSwipedIds] = useState(() => new Set())
  const [matchedPet, setMatchedPet] = useState(null)
  const [detailsPet, setDetailsPet] = useState(null)
  const [reasonsPet, setReasonsPet] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPreferencesDrawerOpen, setIsPreferencesDrawerOpen] = useState(false)
  const stackRef = useRef(null)

  const hasCompletedQuiz = hasCompletedLifestyleQuiz(user)

  // Só abre o quiz automaticamente para quem já está logado — para
  // visitantes anônimos não há perfil algum para salvar as respostas
  const [isQuizOpen, setIsQuizOpen] = useState(() => isAuthenticated && !hasCompletedQuiz)
  const [isPreparingMatches, setIsPreparingMatches] = useState(false)

  const {
    filters,
    setCity,
    setMaxDistance,
    setSort,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
  } = useMatchPreferences()

  const eligiblePets = useMemo(() => {
    // 1. IDs de pets que o usuário logado já solicitou — um pedido
    // recusado (REJECTED) libera o pet de volta no deck; qualquer outro
    // status (PENDING, ACCEPTED, CONCLUDED) mantém o pet oculto
    const requestedAnimalIds = isAuthenticated
      ? requests
          .filter((r) => r.adopter?.userId === user?.id && r.status !== 'REJECTED')
          .map((r) => r.animalId)
      : []

    // 2. Filtro base: espécie preferida + já solicitados + já adotados.
    // 🆕 O filtro de ADOTADO não depende de QUEM pediu — uma vez que o
    // pet foi adotado por qualquer pessoa, ele nunca mais aparece no
    // deck de ninguém.
    const baseFiltered = pets.filter((pet) => {
      if (requestedAnimalIds.includes(pet.id)) return false
      if (pet.status === 'ADOTADO') return false

      if (user?.speciesPreference && user.speciesPreference !== 'BOTH') {
        return pet.species === user.speciesPreference
      }
      return true
    })

    if (!user) return baseFiltered

    // 3. Aplica o algoritmo de match e oculta os próprios animais do doador
    return sortPetsByMatchScore(user, baseFiltered, user.id)
  }, [pets, user, isAuthenticated, requests])

  // 4. Preferências do painel esquerdo por último: elas filtram e reordenam
  // o resultado do algoritmo, sem interferir nas regras de elegibilidade
  const preferredPets = useMemo(
    () => applyMatchPreferences({ pets: eligiblePets, user, filters }),
    [eligiblePets, user, filters]
  )

  // 🆕 Filtragem por ID — imune a preferredPets mudar de tamanho no meio da sessão
  const visiblePets = useMemo(
    () => preferredPets.filter((pet) => !swipedIds.has(pet.id)),
    [preferredPets, swipedIds]
  )

  const topPet = visiblePets[0]

  const handleQuizComplete = (answers) => {
    updateProfile(answers)
    setIsQuizOpen(false)
    setIsPreparingMatches(true)
    setTimeout(() => setIsPreparingMatches(false), 900)
  }

  // Sem sessão não há perfil onde salvar as respostas, então o convite de
  // login entra no lugar do quiz
  const handleOpenQuiz = () => {
    setIsPreferencesDrawerOpen(false)
    setReasonsPet(null)

    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    setIsQuizOpen(true)
  }

  const markAsSwiped = (petId) => {
    setSwipedIds((prev) => {
      const next = new Set(prev)
      next.add(petId)
      return next
    })
  }

  const handleSwipeLeft = () => {
    const passedPet = topPet
    markAsSwiped(passedPet.id)
    registerPass(passedPet.id).catch((err) => console.error('Falha ao registrar pass:', err))
  }

  const handleSwipeRight = () => {
    const likedPet = topPet
    markAsSwiped(likedPet.id)

    setMatchedPet(likedPet)
    setTimeout(() => setMatchedPet(null), 1800)

    createRequest({
      animalId: likedPet.id,
      ownerId: likedPet.ownerId,
      adopter: buildAdopterSnapshot(user, profileCompletion),
    })
  }

  const handleReset = () => setSwipedIds(new Set())

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const preferencesPanelProps = {
    filters,
    onCityChange: setCity,
    onDistanceChange: setMaxDistance,
    onSortChange: setSort,
    onClear: clearFilters,
    hasActiveFilters,
    onOpenQuiz: handleOpenQuiz,
    hasCompletedQuiz,
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-950 px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col items-center gap-1.5 text-center lg:mb-8 lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-300">
            <LuSparkles size={15} />
            AUmatch
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Arraste para encontrar seu match
          </h1>
        </header>

        {/* Split view: ~30% de painel de controle, ~70% de modo foco */}
        <div className="lg:flex lg:items-start lg:gap-8">
          <MatchPreferencesSidebar resultsCount={visiblePets.length} {...preferencesPanelProps} />

          <main className="flex min-w-0 flex-1 flex-col items-center">
            {/* Abaixo de lg o painel de 30% vira esta gaveta */}
            <button
              type="button"
              onClick={() => setIsPreferencesDrawerOpen(true)}
              className="mb-5 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/15 lg:hidden"
            >
              <FaSliders size={14} className="text-amber-300" />
              Filtros e preferências
              {activeFiltersCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-emerald-950">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Modo foco: um pet por vez, e com mais largura no desktop —
                agora o card tem 70% da página só para ele */}
            <div className="h-[70vh] w-full max-w-md sm:h-[75vh] sm:max-h-[640px] lg:max-w-lg">
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
                  isInteractionAllowed={isAuthenticated}
                  onBlockedInteraction={() => setIsAuthModalOpen(true)}
                  onExplainMatch={() => topPet && setReasonsPet(topPet)}
                />
              ) : (
                <EmptyStackState onReset={handleReset} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
              )}
            </div>

            <SwipeActionButtons
              onPass={() => stackRef.current?.triggerPass()}
              onLike={() => stackRef.current?.triggerLike()}
              onInfo={() => topPet && setDetailsPet(topPet)}
              isTopOng={topPet?.listingType === 'NGO'}
              disabled={!topPet || isPreparingMatches}
            />
          </main>
        </div>
      </div>

      <MatchPreferencesDrawer
        isOpen={isPreferencesDrawerOpen}
        onClose={() => setIsPreferencesDrawerOpen(false)}
        resultsCount={visiblePets.length}
        {...preferencesPanelProps}
      />

      <MatchToast pet={matchedPet} />

      {detailsPet && <PetDetailModal pet={detailsPet} onClose={() => setDetailsPet(null)} />}

      {reasonsPet && (
        <MatchReasonsModal pet={reasonsPet} onClose={() => setReasonsPet(null)} onOpenQuiz={handleOpenQuiz} />
      )}

      <OnboardingQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} onComplete={handleQuizComplete} />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para curtir, favoritar ou ajustar seu perfil no AUmatch, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}
    </div>
  )
}

export default AumatchPage
