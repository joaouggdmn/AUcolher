import { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaPaw,
  FaComments,
  FaCircleCheck,
  FaClock,
  FaLock,
  FaHandHoldingHeart,
  FaBan,
  FaRotateLeft,
  FaBullhorn,
} from "react-icons/fa6";
import { useAuth } from "../../../core/context/AuthContext";
import { useChatMessages } from "../hooks/useChatMessages";
import { useConcludeAdoption } from "../../../core/hooks/useConcludeAdoption";
import { getErrorMessage } from "../../../core/utils/apiError";
import { markConversationSeen } from "../../../core/utils/chatReadState";
import ConfirmAdoptionModal from "../../adocao/components/ConfirmAdoptionModal";
import AdoptionConcludedPanel from "./AdoptionConcludedPanel";

// Linha de sistema do retorno ou do repasse (regras §3.3). Por enquanto só
// de exibição, derivada do pedido: com o chat na API, a própria API grava
// ANIMAL_RETURNED / ANIMAL_REHOMED na conversa
function returnSystemMessage(contact) {
  const animal = contact.animalName;
  if (contact.returnInfo?.type === "RETURNED") return `${animal} voltou para quem doou.`;
  return contact.isOwnerView
    ? `${contact.name} anunciou ${animal} para uma nova adoção.`
    : `Você anunciou ${animal} para uma nova adoção.`;
}

// Por que a conversa foi encerrada, do ponto de vista de quem está lendo
function closedConversationMessage(contact) {
  const animal = contact.animalName;
  switch (contact.cancelReason) {
    case "LISTING_REMOVED":
      return `Conversa encerrada: o anúncio de ${animal} foi removido pela moderação do AUcolher e o pedido de adoção foi cancelado.`;
    case "ACCOUNT_BANNED":
      return `Conversa encerrada: a conta de ${contact.name} foi suspensa pela moderação do AUcolher e o pedido de adoção foi cancelado.`;
    case "ADOPTER_WITHDREW":
      return contact.isOwnerView
        ? `Conversa encerrada: ${contact.name} cancelou o pedido de adoção de ${animal}.`
        : `Conversa encerrada: você cancelou o pedido de adoção de ${animal}.`;
    case "OWNER_WITHDREW":
      return contact.isOwnerView
        ? `Conversa encerrada: você desistiu da adoção de ${animal}.`
        : `Conversa encerrada: ${contact.name} desistiu da adoção de ${animal}.`;
    case "ANIMAL_ADOPTED":
      return `Conversa encerrada: ${animal} foi adotado por outra pessoa.`;
    case "ANIMAL_UNAVAILABLE":
      return `Conversa encerrada: o anúncio de ${animal} saiu do ar e o pedido de adoção foi cancelado.`;
    default:
      return "Conversa encerrada: o pedido de adoção foi cancelado.";
  }
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatConversationPanel({ contact, onBack }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useChatMessages(contact.requestId);
  const { requestDelivery, concludeAdoption, cancelAdoption } = useConcludeAdoption();
  const [draft, setDraft] = useState("");
  // null | 'request-delivery' (passo 1, doador) | 'conclude' (passo 2, adotante)
  // | 'owner-withdraw' | 'adopter-cancel' (desistência de qualquer lado)
  const [confirmModalMode, setConfirmModalMode] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Conversa aberta = tudo o que chegou até agora foi visto; zera o
  // contador dela no badge da sidebar
  useEffect(() => {
    markConversationSeen(user?.id, contact.requestId);
  }, [user?.id, contact.requestId, messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(draft);
    setDraft("");
  };

  const openConfirm = (mode) => {
    setConfirmError(null);
    setConfirmModalMode(mode);
  };

  // A API valida cada passo: se recusar, o modal continua aberto com o motivo
  const handleConfirmModalConfirm = async () => {
    const target = { requestId: contact.requestId, animalName: contact.animalName };
    setIsConfirming(true);
    setConfirmError(null);
    try {
      if (confirmModalMode === "request-delivery") {
        await requestDelivery(target);
      } else if (confirmModalMode === "conclude") {
        await concludeAdoption(target);
      } else {
        await cancelAdoption({ ...target, byOwner: contact.isOwnerView });
      }
      setConfirmModalMode(null);
    } catch (error) {
      setConfirmError(getErrorMessage(error, "Não foi possível concluir. Tente novamente."));
    } finally {
      setIsConfirming(false);
    }
  };

  // Chat vira somente leitura assim que o doador confirma a entrega
  // (AWAITING_DELIVERY) — o histórico continua visível, só o input some
  const isAwaitingDelivery = contact.status === "AWAITING_DELIVERY";
  // Depois de um retorno ou repasse a adoção continua tendo acontecido: o
  // chat segue travado e as avaliações continuam liberadas
  const hasReturn = contact.status === "RETURNED" || contact.status === "REHOMED";
  const isConcluded = contact.status === "CONCLUDED" || hasReturn;
  // Pedido cancelado durante o andamento (desistência, outra adoção, anúncio
  // fora do ar ou moderação): o histórico fica, travado, com o motivo
  const isClosed = contact.status === "CANCELLED";
  // Qualquer uma das partes pode desistir enquanto o pedido não foi concluído
  const canCancel = contact.status === "ACCEPTED" || isAwaitingDelivery;
  const initial = contact.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="flex h-full flex-col bg-[#f5f3ef]">
      <div className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para a lista de conversas"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-emerald-700 md:hidden"
        >
          <FaArrowLeft size={15} />
        </button>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-black text-white">
          {contact.photoUrl ? (
            <img
              src={contact.photoUrl}
              alt={contact.name}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-emerald-950">
            {contact.name}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
            <FaPaw size={10} className="text-amber-500" />
            Sobre {contact.animalName}
          </p>
        </div>

        {/* Passo 1 (doador): inicia o handshake — some assim que o pedido
            entra em AWAITING_DELIVERY, dando lugar à badge de "aguardando" */}
        {contact.isOwnerView && contact.status === "ACCEPTED" && (
          <button
            type="button"
            onClick={() => openConfirm("request-delivery")}
            title="Confirmar Entrega"
            aria-label="Confirmar Entrega"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-xs font-extrabold text-emerald-950 shadow-md shadow-amber-500/30 transition-all duration-300 hover:from-amber-300 hover:to-amber-400 sm:px-4"
          >
            <FaHandHoldingHeart size={14} />
            <span className="hidden sm:inline">Confirmar Entrega</span>
          </button>
        )}

        {/* Doador aguardando o passo 2 — só o adotante pode agir agora */}
        {contact.isOwnerView && isAwaitingDelivery && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700 sm:px-4">
            <FaClock size={13} />
            <span className="hidden sm:inline">Aguardando confirmação</span>
          </span>
        )}

        {isConcluded && !hasReturn && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">
            <FaCircleCheck size={13} />
            <span className="hidden sm:inline">Adoção Concluída</span>
          </span>
        )}

        {hasReturn && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-sky-50 px-3 py-2 text-xs font-extrabold text-sky-700">
            {contact.status === "RETURNED" ? <FaRotateLeft size={12} /> : <FaBullhorn size={12} />}
            <span className="hidden sm:inline">
              {contact.status === "RETURNED" ? "Devolvido ao doador" : "Repassado"}
            </span>
          </span>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => openConfirm(contact.isOwnerView ? "owner-withdraw" : "adopter-cancel")}
            title={contact.isOwnerView ? "Desistir da adoção" : "Cancelar pedido"}
            aria-label={contact.isOwnerView ? "Desistir da adoção" : "Cancelar pedido"}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-slate-400 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-600"
          >
            <FaBan size={12} />
            <span className="hidden lg:inline">{contact.isOwnerView ? "Desistir" : "Cancelar pedido"}</span>
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
              <FaComments size={18} />
            </span>
            <p className="text-sm text-slate-500">
              {isClosed
                ? "Nenhuma mensagem nesta conversa."
                : `Nenhuma mensagem ainda. Diga oi para ${contact.name.split(" ")[0]}!`}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            // Mensagem de sistema (celebração de adoção) — bolha
            // centralizada, visualmente distinta das mensagens normais
            if (message.senderId === "system") {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="flex max-w-[85%] items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-700 shadow-sm sm:max-w-[70%]">
                    <FaPaw size={11} className="shrink-0 text-amber-500" />
                    {message.text}
                  </div>
                </div>
              );
            }

            const isMine = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[60%] ${
                    isMine
                      ? "rounded-br-md bg-emerald-700 text-white"
                      : "rounded-bl-md bg-white text-slate-700"
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${isMine ? "text-emerald-100/70" : "text-slate-400"}`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {hasReturn && contact.returnInfo && (
          <div className="flex justify-center">
            <div className="flex max-w-[85%] items-center gap-2 rounded-2xl bg-sky-50 px-4 py-2 text-center text-xs font-bold text-sky-700 shadow-sm sm:max-w-[70%]">
              {contact.status === "RETURNED" ? (
                <FaRotateLeft size={11} className="shrink-0 text-sky-500" />
              ) : (
                <FaBullhorn size={11} className="shrink-0 text-sky-500" />
              )}
              {returnSystemMessage(contact)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {isClosed ? (
        <p className="flex shrink-0 items-center justify-center gap-2 border-t bg-rose-50 px-4 py-3.5 text-center text-xs font-semibold text-rose-700">
          <FaBan size={11} className="shrink-0" />
          {closedConversationMessage(contact)}
        </p>
      ) : isConcluded ? (
        <AdoptionConcludedPanel contact={contact} />
      ) : isAwaitingDelivery ? (
        <div className="flex shrink-0 flex-col gap-3 border-t bg-slate-50 px-4 py-3.5">
          <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
            <FaLock size={11} className="shrink-0 text-slate-400" />
            Chat bloqueado. Aguardando a confirmação de recebimento do adotante.
          </p>

          {/* Passo 2 (adotante): CTA em destaque para encerrar o processo */}
          {!contact.isOwnerView && (
            <button
              type="button"
              onClick={() => openConfirm("conclude")}
              className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-sm font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400"
            >
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500" />
              </span>
              <FaCircleCheck size={15} />
              Confirmar Chegada do Pet
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex shrink-0 items-center gap-2 border-t bg-white p-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="min-h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Enviar mensagem"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white transition-all duration-300 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      )}

      {confirmModalMode && (
        <ConfirmAdoptionModal
          mode={confirmModalMode}
          animalName={contact.animalName}
          isProcessing={isConfirming}
          error={confirmError}
          onConfirm={handleConfirmModalConfirm}
          onCancel={() => setConfirmModalMode(null)}
        />
      )}
    </div>
  );
}

export default ChatConversationPanel;
