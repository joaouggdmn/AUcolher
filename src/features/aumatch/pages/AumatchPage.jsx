import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LuSparkles } from 'react-icons/lu'
import { FaArrowRotateRight, FaSliders, FaTriangleExclamation } from 'react-icons/fa6'
import PetCardStack from '../components/PetCardStack'
import SwipeActionButtons from '../components/SwipeActionButtons'
import EmptyStackState from '../components/EmptyStackState'
import MatchToast from '../components/MatchToast'
import PetDetailModal from '../components/PetDetailModal'
import MatchReasonsModal from '../components/MatchReasonsModal'
import AdoptersOnlyModal from '../components/AdoptersOnlyModal'
import MatchPreferencesSidebar from '../components/filters/MatchPreferencesSidebar'
import MatchPreferencesDrawer from '../components/filters/MatchPreferencesDrawer'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { isSameId } from '../../../core/utils/ids'
import { useModeration } from '../../admin/hooks/useModeration'
import { applyMatchPreferences } from '../utils/matchFilters'
import { useMatchPreferences } from '../hooks/useMatchPreferences'
import { matchDeckKeys, useAumatchDeck } from '../hooks/useAumatchDeck'
import OnboardingQuiz from '../../onboarding/components/OnboardingQuiz'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'

// Cartão que ocupa o lugar do deck enquanto ele carrega ou recalcula
function DeckStatusCard({ children }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      {children}
    </div>
  )
}

function AumatchPage() {
  const { isAccountBanned } = useModeration()
  const { user, isAuthenticated, isMatchProfileReady, saveMatchProfile } = useAuth()
  const { pets, isAdopter, isLoading, isError, refetch } = useAumatchDeck()
  const { requests, createRequest } = useAdoptionRequests()
  const queryClient = useQueryClient()
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
  const [isAdoptersOnlyOpen, setIsAdoptersOnlyOpen] = useState(false)
  const [isPreferencesDrawerOpen, setIsPreferencesDrawerOpen] = useState(false)
  const [isPreparingMatches, setIsPreparingMatches] = useState(false)
  const stackRef = useRef(null)

  const hasCompletedQuiz = hasCompletedLifestyleQuiz(user)

  // 'auto': o quiz abre sozinho para a pessoa que ainda não respondeu — só
  // depois que o perfil veio da API, senão abriria para quem já respondeu em
  // outro aparelho. Fechado ou concluído, só volta pelo botão
  const [quizMode, setQuizMode] = useState('auto')
  const isQuizOpen =
    quizMode === 'open' || (quizMode === 'auto' && isAdopter && isMatchProfileReady && !hasCompletedQuiz)

  const {
    filters,
    setCity,
    setSort,
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
  } = useMatchPreferences()

  // A API já tira do deck os adotados, os inativos, os próprios anúncios e
  // as outras espécies. Aqui ficam as regras que ela ainda não conhece
  const eligiblePets = useMemo(() => {
    // 🔴 Pedidos de adoção ainda são mock (localStorage): o pet que esta
    // conta já pediu sai do deck — um pedido recusado (REJECTED) libera o pet
    // de volta. Pedidos antigos de animais do AnimalContext têm ids que se
    // repetem na API, então só contam os pedidos de animais da API
    const requestedAnimalIds = new Set(
      isAuthenticated
        ? requests
            .filter((r) => r.adopter?.userId === user?.id && r.status !== 'REJECTED' && r.animalSource === 'api')
            .map((r) => String(r.animalId))
        : []
    )

    return pets.filter((pet) => {
      if (requestedAnimalIds.has(String(pet.id))) return false
      // Na prévia de uma ONG, os anúncios dela mesma não entram
      if (user && isSameId(pet.ownerId, user.id)) return false
      // Dono banido pela moderação: sai na hora, sem esperar o deck recarregar
      return !isAccountBanned({ id: pet.ownerId, name: pet.organizationName ?? pet.ownerName })
    })
  }, [pets, user, isAuthenticated, requests, isAccountBanned])

  // Preferências do painel esquerdo por último: elas filtram e reordenam
  // o resultado do algoritmo, sem interferir nas regras de elegibilidade
  const preferredPets = useMemo(
    () => applyMatchPreferences({ pets: eligiblePets, filters }),
    [eligiblePets, filters]
  )

  // 🆕 Filtragem por ID — imune a preferredPets mudar de tamanho no meio da sessão
  const visiblePets = useMemo(
    () => preferredPets.filter((pet) => !swipedIds.has(pet.id)),
    [preferredPets, swipedIds]
  )

  const topPet = visiblePets[0]

  // Grava no banco antes de fechar: se a API recusar, o erro sobe para o
  // quiz, que continua aberto com as respostas. Depois, o deck volta da API
  // com o score recalculado
  const handleQuizComplete = async (answers) => {
    await saveMatchProfile(answers)
    setQuizMode('closed')
    setIsPreparingMatches(true)
    try {
      await queryClient.invalidateQueries({ queryKey: matchDeckKeys.all })
    } finally {
      setIsPreparingMatches(false)
    }
  }

  // Sem sessão não há perfil onde salvar as respostas, então o convite de
  // login entra no lugar do quiz; ONG e admin não usam o AUmatch
  const handleOpenQuiz = () => {
    setIsPreferencesDrawerOpen(false)
    setReasonsPet(null)

    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    if (!isAdopter) {
      setIsAdoptersOnlyOpen(true)
      return
    }
    setQuizMode('open')
  }

  const handleBlockedInteraction = () => {
    if (isAuthenticated) setIsAdoptersOnlyOpen(true)
    else setIsAuthModalOpen(true)
  }

  const markAsSwiped = (petId) => {
    setSwipedIds((prev) => {
      const next = new Set(prev)
      next.add(petId)
      return next
    })
  }

  // O "passar" não é gravado: vale só nesta sessão, e o "Recomeçar" traz o pet de volta
  const handleSwipeLeft = () => markAsSwiped(topPet.id)

  const handleSwipeRight = () => {
    const likedPet = topPet
    markAsSwiped(likedPet.id)

    setMatchedPet(likedPet)
    setTimeout(() => setMatchedPet(null), 1800)

    createRequest(likedPet.id).catch((error) => console.error('Falha ao enviar o pedido:', error))
  }

  const handleReset = () => setSwipedIds(new Set())

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const preferencesPanelProps = {
    filters,
    onCityChange: setCity,
    onSortChange: setSort,
    onClear: clearFilters,
    hasActiveFilters,
    onOpenQuiz: handleOpenQuiz,
    hasCompletedQuiz,
    isQuizAvailable: !isAuthenticated || isAdopter,
  }

  const renderDeck = () => {
    if (isPreparingMatches || isLoading) {
      return (
        <DeckStatusCard>
          <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
            <LuSparkles size={24} />
          </span>
          <p className="text-sm font-semibold text-emerald-100">
            {isAdopter ? 'Calculando seus melhores matches...' : 'Carregando os pets...'}
          </p>
        </DeckStatusCard>
      )
    }

    if (isError) {
      return (
        <DeckStatusCard>
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/15 text-rose-300">
            <FaTriangleExclamation size={22} />
          </span>
          <p className="text-sm font-semibold text-emerald-100">Não foi possível carregar o AUmatch agora.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-bold text-emerald-950 transition-all duration-300 hover:bg-amber-300"
          >
            <FaArrowRotateRight size={13} />
            Tentar de novo
          </button>
        </DeckStatusCard>
      )
    }

    if (!topPet) {
      return <EmptyStackState onReset={handleReset} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
    }

    return (
      <PetCardStack
        ref={stackRef}
        pets={visiblePets}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        isInteractionAllowed={isAdopter}
        onBlockedInteraction={handleBlockedInteraction}
        onExplainMatch={() => topPet && setReasonsPet(topPet)}
      />
    )
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
          {isAuthenticated && !isAdopter && (
            <p className="text-sm text-emerald-100/70">
              Prévia: curtir e responder o quiz é para contas de pessoa física.
            </p>
          )}
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
            <div className="h-[70vh] w-full max-w-md sm:h-[75vh] sm:max-h-[640px] lg:max-w-lg">{renderDeck()}</div>

            <SwipeActionButtons
              onPass={() => stackRef.current?.triggerPass()}
              onLike={() => stackRef.current?.triggerLike()}
              onInfo={() => topPet && setDetailsPet(topPet)}
              isTopOng={topPet?.listingType === 'NGO'}
              disabled={!topPet || isPreparingMatches || isLoading || isError}
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

      <OnboardingQuiz isOpen={isQuizOpen} onClose={() => setQuizMode('closed')} onComplete={handleQuizComplete} />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para curtir, favoritar ou ajustar seu perfil no AUmatch, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}

      {isAdoptersOnlyOpen && <AdoptersOnlyModal onClose={() => setIsAdoptersOnlyOpen(false)} />}
    </div>
  )
}

export default AumatchPage
