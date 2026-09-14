import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuSparkles } from "react-icons/lu";
import PetCardStack from "../components/PetCardStack";
import SwipeActionButtons from "../components/SwipeActionButtons";
import EmptyStackState from "../components/EmptyStackState";
import MatchToast from "../components/MatchToast";
import PetDetailModal from "../components/PetDetailModal";
import { useAnimals } from "../../../core/context/AnimalContext";
import { useAuth } from "../../../core/context/AuthContext";
import { registerLike, registerPass } from "../services/aumatchService";
import { sortPetsByMatchScore } from "../utils/matchScore";
import OnboardingQuiz from "../../onboarding/components/OnboardingQuiz";
import { hasCompletedLifestyleQuiz } from "../../onboarding/utils/quizStatus";
import AuthRequiredModal from "../../../core/components/ui/AuthRequiredModal";

import { useAdoptionRequests } from "../../../core/context/AdoptionRequestContext";
import { useProfileCompletion } from "../../../core/hooks/useProfileCompletion";
import { buildAdopterSnapshot } from "../../adocao/utils/buildAdopterSnapshot";

function AumatchPage() {
  const { animals: pets } = useAnimals();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { requests, createRequest } = useAdoptionRequests();
  const { percentage: profileCompletion } = useProfileCompletion(user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedPet, setMatchedPet] = useState(null);
  const [detailsPet, setDetailsPet] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const stackRef = useRef(null);

  // Só abre o quiz automaticamente para quem já está logado — para
  // visitantes anônimos não há perfil algum para salvar as respostas
  const [isQuizOpen, setIsQuizOpen] = useState(
    () => isAuthenticated && !hasCompletedLifestyleQuiz(user),
  );
  const [isPreparingMatches, setIsPreparingMatches] = useState(false);

  const eligiblePets = useMemo(() => {
    // 1. Mapeia os IDs dos pets que o usuário logado já solicitou
    const requestedAnimalIds = isAuthenticated
      ? requests
          .filter(
            (r) => r.adopter?.userId === user?.id && r.status !== "REJECTED",
          )
          .map((r) => r.animalId)
      : [];

    // 2. Filtra a lista base (remove os já solicitados e aplica filtro de espécie)
    const baseFiltered = pets.filter((pet) => {
      if (requestedAnimalIds.includes(pet.id)) return false; // Some da tela!

      if (user?.speciesPreference && user.speciesPreference !== "BOTH") {
        return pet.species === user.speciesPreference;
      }
      return true;
    });

    if (!user) return baseFiltered;

    // 3. Aplica o algoritmo de match e oculta os próprios animais do doador
    return sortPetsByMatchScore(user, baseFiltered, user.id);
  }, [pets, user, isAuthenticated, requests]);
  // Importante: 'requests' adicionado como dependência para a tela atualizar na hora!

  const visiblePets = eligiblePets.slice(currentIndex);
  const topPet = visiblePets[0];

  const handleQuizComplete = (answers) => {
    updateProfile(answers);
    setIsQuizOpen(false);
    setIsPreparingMatches(true);
    setTimeout(() => setIsPreparingMatches(false), 900);
  };

  const handleSwipeLeft = () => {
    const passedPet = topPet;
    setCurrentIndex((i) => i + 1);
    registerPass(passedPet.id).catch((err) =>
      console.error("Falha ao registrar pass:", err),
    );
  };

  const handleSwipeRight = () => {
    const likedPet = topPet;
    setCurrentIndex((i) => i + 1);

    setMatchedPet(likedPet);
    setTimeout(() => setMatchedPet(null), 1800);

    // A mágica acontece aqui: conecta o swipe ao sistema de adoção
    createRequest({
      animalId: likedPet.id,
      ownerId: likedPet.ownerId,
      adopter: buildAdopterSnapshot(user, profileCompletion),
    });

    // Se você ainda tiver o registerLike pro backend registrar métricas, pode deixar:
    // registerLike(likedPet.id).catch(err => console.error(err))
  };

  const handleReset = () => setCurrentIndex(0);

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false);
    navigate("/login", { state: { from: location } });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-emerald-950 px-4 pb-16 pt-24 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
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
            <p className="text-sm font-semibold text-emerald-100">
              Calculando seus melhores matches...
            </p>
          </div>
        ) : topPet ? (
          <PetCardStack
            ref={stackRef}
            pets={visiblePets}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isInteractionAllowed={isAuthenticated}
            onBlockedInteraction={() => setIsAuthModalOpen(true)}
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
          isTopOng={topPet?.listingType === "NGO"}
          disabled={!topPet || isPreparingMatches}
        />
      </div>

      <MatchToast pet={matchedPet} />

      {detailsPet && (
        <PetDetailModal pet={detailsPet} onClose={() => setDetailsPet(null)} />
      )}

      <OnboardingQuiz
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={handleQuizComplete}
      />

      {isAuthModalOpen && (
        <AuthRequiredModal
          message="Para curtir ou passar animais no AUmatch, você precisa estar conectado à sua conta."
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}
    </div>
  );
}

export default AumatchPage;
