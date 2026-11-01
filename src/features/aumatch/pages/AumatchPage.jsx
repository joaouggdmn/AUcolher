import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LuSparkles } from 'react-icons/lu'
import { FaAnglesLeft, FaArrowRotateRight, FaSliders, FaTriangleExclamation } from 'react-icons/fa6'
import PetCardStack from '../components/PetCardStack'
import SwipeActionButtons from '../components/SwipeActionButtons'
import EmptyStackState from '../components/EmptyStackState'
import MatchToast from '../components/MatchToast'
import PetDetailModal from '../components/PetDetailModal'
import MatchReasonsModal from '../components/MatchReasonsModal'
import AdoptersOnlyModal from '../components/AdoptersOnlyModal'
import MatchPreferencesDrawer from '../components/filters/MatchPreferencesDrawer'
import MatchPreferencesSidebar from '../components/filters/MatchPreferencesSidebar'
import { useAuth } from '../../../core/context/AuthContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { isSameId } from '../../../core/utils/ids'
import { AUMATCH_PANEL_OPEN_KEY } from '../../../core/utils/storageKeys'
import { applyMatchPreferences } from '../utils/matchFilters'
import { buildCityOptions } from '../../animais/components/filters/filterOptions'
import { useMatchPreferences } from '../hooks/useMatchPreferences'
import { matchDeckKeys, useAumatchDeck } from '../hooks/useAumatchDeck'
import OnboardingQuiz from '../../onboarding/components/OnboardingQuiz'
import { hasCompletedLifestyleQuiz } from '../../onboarding/utils/quizStatus'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'

// A coluna de filtros do desktop lembra se ficou aberta. Sem storage
// (aba anônima, bloqueio), só começa guardada
function readPanelOpen() {
  try {
    return localStorage.getItem(AUMATCH_PANEL_OPEN_KEY) === '1'
  } catch {
    return false
  }
}

function savePanelOpen(isOpen) {
  try {
    localStorage.setItem(AUMATCH_PANEL_OPEN_KEY, isOpen ? '1' : '0')
  } catch {
    // sem storage: a escolha vale só até recarregar
  }
}

// Cartão que ocupa o lugar do deck enquanto ele carrega ou recalcula
function DeckStatusCard({ children }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
      {children}
    </div>
  )
}

function AumatchPage() {
  const { user, isAuthenticated, isMatchProfileReady, saveMatchProfile } = useAuth()
  const { pets, isAdopter, isLoading, isError, refetch } = useAumatchDeck()
  const { createRequest } = useAdoptionRequests()
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
  const [isPanelOpen, setIsPanelOpen] = useState(readPanelOpen)
  const [isPreparingMatches, setIsPreparingMatches] = useState(false)
  const [likeError, setLikeError] = useState(null)
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
    clearFilters,
    activeFiltersCount,
    hasActiveFilters,
  } = useMatchPreferences()

  // A API já tira do deck os adotados, os inativos, os próprios anúncios, as
  // outras espécies e os pets que a pessoa já pediu. Aqui ficam as regras
  // que ela ainda não conhece
  // Na prévia de uma ONG, os anúncios dela mesma não entram
  const eligiblePets = useMemo(
    () => pets.filter((pet) => !(user && isSameId(pet.ownerId, user.id))),
    [pets, user]
  )

  // As cidades do filtro são as dos pets do próprio deck, que vem inteiro
  const cityOptions = useMemo(
    () => buildCityOptions(eligiblePets.map((pet) => pet.city), filters.city),
    [eligiblePets, filters.city]
  )

  // Preferências do painel por último: elas filtram e reordenam
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

    // O pet já saiu da fila; se a API recusar (ex.: já pedido em outra aba), avisa
    createRequest(likedPet.id).catch((error) =>
      setLikeError(getErrorMessage(error, `Não foi possível enviar o pedido para ${likedPet.name}.`))
    )
  }

  const handleReset = () => setSwipedIds(new Set())

  // Desktop: mostra ou guarda a coluna ao lado do deck. Abaixo de lg não há
  // espaço para ela, então o mesmo botão abre a gaveta
  const handleTogglePreferences = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const next = !isPanelOpen
      setIsPanelOpen(next)
      savePanelOpen(next)
    } else {
      setIsPreferencesDrawerOpen(true)
    }
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const preferencesPanelProps = {
    filters,
    cityOptions,
    onCityChange: setCity,
    onClear: clearFilters,
    hasActiveFilters,
    onOpenQuiz: handleOpenQuiz,
    hasCompletedQuiz,
    isQuizAvailable: !isAuthenticated || isAdopter,
    showInterestsLink: isAdopter,
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
        {/* Centralizado, como o deck. Com a coluna aberta (desktop), o bloco
            desliza para a esquerda junto com ela: left e translate animam juntos */}
        <header
          className={`relative left-1/2 mb-6 flex w-fit max-w-full -translate-x-1/2 flex-col items-center gap-1.5 text-center transition-all duration-500 ease-out motion-reduce:transition-none lg:mb-8 ${
            isPanelOpen ? 'lg:left-0 lg:translate-x-0 lg:items-start lg:text-left' : ''
          }`}
        >
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

        {/* Canto superior esquerdo: mostra e guarda a coluna de filtros (no
            mobile, abre a gaveta) */}
        <div className="mb-4 flex">
          <button
            type="button"
            onClick={handleTogglePreferences}
            aria-expanded={isPanelOpen}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/15"
          >
            {isPanelOpen ? (
              <>
                <FaSliders size={13} className="text-amber-300 lg:hidden" />
                <FaAnglesLeft size={13} className="hidden text-amber-300 lg:block" />
              </>
            ) : (
              <FaSliders size={13} className="text-amber-300" />
            )}
            {isPanelOpen ? (
              <>
                <span className="lg:hidden">Filtros e preferências</span>
                <span className="hidden lg:inline">Guardar filtros</span>
              </>
            ) : (
              'Filtros e preferências'
            )}
            {activeFiltersCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-emerald-950">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Modo foco: com a coluna guardada, o deck tem a página só para ele.
            Aberta, ela cresce à esquerda e empurra o deck para a direita */}
        <div className="lg:flex lg:items-start">
          <MatchPreferencesSidebar isOpen={isPanelOpen} resultsCount={visiblePets.length} {...preferencesPanelProps} />

          <main className="flex min-w-0 flex-1 flex-col items-center">
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
      {likeError && (
        <div role="alert" className="fixed inset-x-0 top-24 z-[110] flex justify-center px-4">
          <p className="flex items-center gap-3 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-2xl">
            {likeError}
            <button type="button" onClick={() => setLikeError(null)} className="font-black" aria-label="Fechar aviso">
              ×
            </button>
          </p>
        </div>
      )}

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
