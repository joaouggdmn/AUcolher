import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaVenus,
  FaMars,
  FaLocationDot,
  FaRulerVertical,
  FaCakeCandles,
  FaHeart,
  FaShieldHalved,
  FaCircleCheck,
  FaArrowRight,
  FaHouseChimney,
  FaPen,
  FaTrashCan,
} from "react-icons/fa6";
import { useAuth } from "../../../core/context/AuthContext";
import { getErrorMessage } from "../../../core/utils/apiError";
import Spinner from "../../../core/components/ui/Spinner";
import { useAdoptionRequests } from "../../../core/context/AdoptionRequestContext";
import { useSentRequests } from "../../../core/hooks/useSentRequests";
import { SENT_STATUS_META } from "../../adocao/utils/requestStatus";
import ReturnInfo from "../../adocao/components/ReturnInfo";
import { isSameId } from "../../../core/utils/ids";
import AuthRequiredModal from "../../../core/components/ui/AuthRequiredModal";
import SuccessToast from "../../../core/components/ui/SuccessToast";
import ModerationNotice from "../../../core/components/ui/ModerationNotice";
import ModeratedNote from "../../../core/components/ui/ModeratedNote";
import { ADMIN_PATHS } from "../../admin/panel/adminPaths";
import PhotoGallery from "../components/PhotoGallery";
import HealthBadges from "../components/HealthBadges";
import InterestInfoBubble from "../components/InterestInfoBubble";
import BehaviorProfile from "../components/BehaviorProfile";
import OwnerListingPanel from "../components/OwnerListingPanel";
import { useAnimal } from "../hooks/useAnimais";
import ReportButton from "../../denuncias/components/ReportButton";
import ListingUnavailable from "../components/ListingUnavailable";
import ModerationAction from "../../admin/components/ModerationAction";
import { useRemoveAnimal } from "../../admin/hooks/useAdmin";
import { removeListingDescription } from "../../admin/utils/moderationText";

const SIZE_LABELS = { SMALL: "Pequeno", MEDIUM: "Médio", LARGE: "Grande" };

function AnimalDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: animal, isLoading, error } = useAnimal(id);
  const { createRequest } = useAdoptionRequests();
  const { sentRequests } = useSentRequests();
  const removeAnimal = useRemoveAnimal();
  const [isSending, setIsSending] = useState(false);
  const [requestError, setRequestError] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.justCreated ? "Pet cadastrado com sucesso!" : (location.state?.flash ?? null),
  );

  if (isLoading) {
    return (
      <div className="pt-32">
        <Spinner />
      </div>
    );
  }

  // 404 (inexistente, ou tirado do ar por outra pessoa) cai no "não encontrado"
  // abaixo; qualquer outro erro é de conexão/servidor e merece outra mensagem
  if (error && error.response?.status !== 404) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
          Não foi possível carregar este animal
        </h1>
        <p className="mt-2 text-slate-500">{getErrorMessage(error)}</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
          Animal não encontrado
        </h1>
        <p className="mt-2 text-slate-500">
          Esse anúncio pode ter sido removido ou o link está incorreto.
        </p>
        <Link
          to="/animais"
          className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          Ver outros animais
        </Link>
      </div>
    );
  }

  // Saiu do ar pela moderação: só o admin ainda vê o anúncio
  const isAdmin = user?.userType === "ADMIN";
  if (animal.moderation && !isAdmin) return <ListingUnavailable />;

  const isFemale = animal.sex === "FEMALE";
  const isNgo = animal.listingType === "NGO";
  const ownerDisplayName = isNgo
    ? (animal.organizationName ?? animal.ownerName)
    : animal.ownerName;
  const isOwner = isAuthenticated && isSameId(animal.ownerId, user?.id);
  const isAdopted = animal.status === "ADOPTED";

  // Pessoa e ONG pedem; o admin não adota
  const canRequest = !isAuthenticated || user?.userType === "PESSOA" || user?.userType === "ONG";
  // O meu pedido mais recente para este animal (a lista vem do mais novo).
  // Cancelado libera um pedido novo; recusado é definitivo
  const myRequest = sentRequests.find((request) => isSameId(request.animalId, animal.id));
  const myRequestStatus = myRequest && myRequest.status !== "CANCELLED" ? myRequest.status : null;

  const handleInterestClick = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSending(true);
    setRequestError(null);
    try {
      await createRequest(animal.id);
      setSuccessMessage("Pedido enviado com sucesso! Aguarde a avaliação da ONG/Protetor.");
    } catch (error) {
      setRequestError(getErrorMessage(error, "Não foi possível enviar o pedido."));
    } finally {
      setIsSending(false);
    }
  };

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false);
    navigate("/login", { state: { from: location } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      {animal.moderation && (
        <ModerationNotice>
          {animal.moderation === "REMOVED"
            ? "Anúncio removido pela moderação: ele não aparece mais para ninguém no site."
            : "A conta de quem anunciou foi banida: este anúncio não aparece mais para ninguém no site."}
        </ModerationNotice>
      )}
      {isAdmin && !animal.moderation && animal.status === "INACTIVE" && (
        <ModerationNotice>Quem anunciou tirou este anúncio do ar: ele não aparece para ninguém no site.</ModerationNotice>
      )}
      {/* Só o dono e o admin sabem que a moderação editou o anúncio */}
      {(isOwner || isAdmin) && <ModeratedNote moderatedAt={animal.moderatedAt} size="md" className="mb-6" />}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-28">
          <PhotoGallery
            images={animal.images}
            animalName={animal.name}
            isNgo={isNgo}
          />
        </div>

        <div className="flex flex-col gap-6">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
                {animal.name}
              </h1>
              {isAdopted && (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  <FaHouseChimney size={11} />
                  {isFemale ? "Adotada" : "Adotado"}
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-slate-500">
              {animal.breed}
              <span className="text-slate-300">·</span>
              <FaLocationDot size={12} className="text-emerald-600" />
              {animal.city}, {animal.state}
            </p>
          </header>

          <div className="flex flex-wrap gap-2.5">
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <FaCakeCandles size={13} />
              {animal.ageLabel}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              {isFemale ? <FaVenus size={13} /> : <FaMars size={13} />}
              {isFemale ? "Fêmea" : "Macho"}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <FaRulerVertical size={13} />
              Porte {SIZE_LABELS[animal.size]}
            </span>
          </div>

          {animal.ownerId != null && (
            <Link
              to={`/perfil/publico/${animal.ownerId}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-emerald-950/5"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-emerald-700 text-sm font-black text-white ${
                  isNgo ? "rounded-xl" : "rounded-full"
                }`}
              >
                {animal.ownerPhotoUrl ? (
                  <img
                    src={animal.ownerPhotoUrl}
                    alt={ownerDisplayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  ownerDisplayName?.charAt(0)?.toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Anunciado por
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm font-bold text-emerald-950">
                  {ownerDisplayName}
                  {isNgo && (
                    <FaShieldHalved size={12} className="shrink-0 text-amber-500" />
                  )}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-emerald-700">
                Ver perfil
                <FaArrowRight
                  size={10}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          )}

          <HealthBadges animal={animal} />
          <BehaviorProfile animal={animal} />

          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">
              História
            </h2>
            <p className="mt-2 leading-relaxed text-slate-600 break-words">
              {animal.story}
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {isOwner ? (
              <OwnerListingPanel
                animal={animal}
                onStatusChanged={setSuccessMessage}
              />
            ) : myRequestStatus === "CONCLUDED" ? (
              <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-center">
                <p className="text-sm font-bold text-emerald-900">
                  Você adotou {animal.name}! 🎉
                </p>
                <p className="mt-1 text-sm text-emerald-800/80">
                  Que tal contar como foi a adoção avaliando o doador no chat?
                </p>
              </div>
            ) : myRequestStatus === "RETURNED" || myRequestStatus === "REHOMED" ? (
              <ReturnInfo request={myRequest} viewer="adopter" />
            ) : isAdmin ? (
              // O admin modera, mas não adota: no lugar do pedido, a moderação.
              // Removido não muda mais; adotado fica como histórico (edita, não remove)
              animal.status === "REMOVED" ? null : (
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Moderação</p>
                  <Link
                    to={ADMIN_PATHS.animalEdit(animal.id)}
                    state={{ from: location.pathname }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white py-3.5 text-sm font-bold text-emerald-800 transition-all duration-300 hover:bg-emerald-50"
                  >
                    <FaPen size={12} />
                    Editar anúncio
                  </Link>
                  {!isAdopted && (
                    <ModerationAction
                      icon={FaTrashCan}
                      label="Remover anúncio"
                      dialog={{
                        title: `Remover o anúncio de ${animal.name}?`,
                        description: removeListingDescription(animal.name),
                        confirmLabel: "Remover anúncio",
                        processingLabel: "Removendo...",
                      }}
                      mutation={removeAnimal}
                      variables={{ id: animal.id, ownerId: animal.ownerId }}
                      onDone={() => setSuccessMessage("Anúncio removido.")}
                    />
                  )}
                </div>
              )
            ) : isAdopted ? (
              <div className="rounded-2xl bg-amber-50 px-5 py-4 text-center">
                <p className="text-sm font-bold text-amber-900">
                  {animal.name} já encontrou um lar!
                </p>
                <p className="mt-1 text-sm text-amber-800/80">
                  Este anúncio não recebe mais pedidos de interesse.
                </p>
                <Link
                  to="/animais"
                  className="mt-3 inline-block rounded-full bg-emerald-800 px-5 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
                >
                  Ver outros animais
                </Link>
              </div>
            ) : !canRequest ? null : myRequestStatus ? (
              <div
                className={`rounded-2xl px-5 py-4 text-center ${
                  myRequestStatus === "REJECTED" ? "bg-slate-100" : "bg-emerald-50"
                }`}
              >
                <p className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-950">
                  <FaCircleCheck size={14} className="text-emerald-600" />
                  {myRequestStatus === "REJECTED"
                    ? "O doador recusou o seu pedido"
                    : `Seu pedido: ${SENT_STATUS_META[myRequestStatus].label.toLowerCase()}`}
                </p>
                <p className="mt-1 text-sm text-slate-600">{SENT_STATUS_META[myRequestStatus].description}</p>
                {myRequestStatus !== "REJECTED" && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {myRequestStatus !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() => navigate("/chat", { state: { requestId: myRequest.id } })}
                        className="rounded-full bg-emerald-800 px-5 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
                      >
                        Ir para o chat
                      </button>
                    )}
                    <Link
                      to="/meus-interesses"
                      className="rounded-full border border-emerald-200 px-5 py-2 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-white"
                    >
                      Acompanhar em Meus interesses
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <InterestInfoBubble />

                <button
                  type="button"
                  onClick={handleInterestClick}
                  disabled={isSending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-base font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40 disabled:pointer-events-none disabled:opacity-60"
                >
                  <FaHeart size={16} />
                  {isSending ? "Enviando..." : "Enviar Pedido de Interesse"}
                </button>

                {requestError && (
                  <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-center text-sm font-semibold text-rose-600">
                    {requestError}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Some sozinho para o dono do anúncio e para o admin */}
          <div className="flex justify-center">
            <ReportButton targetType="ANIMAL" target={animal} />
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthRequiredModal
          message={`Para demonstrar interesse no ${animal.name}, você precisa estar conectado à sua conta.`}
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}

      <SuccessToast
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}

export default AnimalDetailsPage;
