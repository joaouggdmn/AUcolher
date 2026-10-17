import { Link } from "react-router-dom";
import {
  FaLocationDot,
  FaCircleCheck,
  FaXmark,
  FaUser,
  FaComments,
  FaClock,
  FaHandHoldingHeart,
  FaPaw,
  FaBan,
} from "react-icons/fa6";
import { LuSparkles } from "react-icons/lu";
import Avatar from "../../../core/components/ui/Avatar";
import { animalDisplayName } from "../utils/requestAnimal";
import ReturnInfo from "./ReturnInfo";

// Ações empilhadas do pedido aceito: mesma altura e largura, uma por linha.
// Lado a lado no grid de 3 colunas, "Confirmar entrega" quebrava a linha e
// ficava desalinhado do botão do chat
const STACKED_ACTION =
  "flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-bold transition-colors duration-300";

function ReceivedRequestCard({
  request,
  onAccept,
  onReject,
  onGoToChat,
  onRequestDelivery,
  onWithdraw,
  isProcessing,
}) {
  const { animal, adopter, status, matchScore } = request;
  const isConcluded = status === "CONCLUDED";
  // A adoção aconteceu e depois o animal voltou ou foi repassado
  const hasReturn = status === "RETURNED" || status === "REHOMED";
  const canWithdraw = (status === "ACCEPTED" || status === "AWAITING_DELIVERY") && onWithdraw;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/5 ${
        isConcluded ? "border-emerald-200" : hasReturn ? "border-sky-200" : "border-slate-100"
      }`}
    >
      <Link
        to={`/animais/${animal.id}`}
        className="flex items-center gap-3 border-b border-slate-100 bg-emerald-50/60 px-5 py-3 transition-colors duration-300 hover:bg-emerald-50"
      >
        {animal.photoUrl ? (
          <img
            src={animal.photoUrl}
            alt={animalDisplayName(animal)}
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
            <FaPaw size={15} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
            Interesse em
          </p>
          <p className="truncate text-sm font-bold text-emerald-950">
            {animalDisplayName(animal)}
          </p>
        </div>

        <span
          title="Compatibilidade calculada pelo AUmatch"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm"
        >
          <LuSparkles size={12} className="text-amber-300" />
          {matchScore}% Match
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar
            name={adopter.name}
            photoUrl={adopter.photoUrl}
            className="h-14 w-14 text-lg ring-2 ring-white shadow-md"
          />
          <div className="min-w-0 flex-1">
            {adopter.userId != null ? (
              <Link
                to={`/perfil/publico/${adopter.userId}`}
                title="Ver perfil e avaliações do adotante"
                className="block truncate text-base font-extrabold tracking-tight text-emerald-950 underline-offset-2 transition-colors duration-300 hover:text-emerald-700 hover:underline"
              >
                {adopter.name}
              </Link>
            ) : (
              <p className="truncate text-base font-extrabold tracking-tight text-emerald-950">
                {adopter.name}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <FaLocationDot size={11} className="text-emerald-600" />
              {adopter.city}, {adopter.state}
            </p>
          </div>

          {/* ONG não tem checklist de pessoa: mostra o tipo da conta no lugar */}
          {adopter.profileCompletion != null ? (
            <span
              title="Completude do perfil do adotante"
              className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"
            >
              <FaUser size={10} />
              {adopter.profileCompletion}%
            </span>
          ) : (
            adopter.isOng && (
              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">ONG</span>
            )
          )}
        </div>

        <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-600">
          {adopter.lifestyleSummary}
        </p>

        <div className="mt-auto pt-1">
          {status === "PENDING" && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onReject(request.id)}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2.5 text-sm font-bold text-rose-600 transition-all duration-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <FaXmark size={13} />
                Recusar
              </button>
              <button
                type="button"
                onClick={() => onAccept(request.id)}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-emerald-900/30 disabled:pointer-events-none disabled:opacity-40"
              >
                <FaCircleCheck size={13} />
                Aceitar
              </button>
            </div>
          )}

          {status === "ACCEPTED" && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onRequestDelivery(request)}
                className={`${STACKED_ACTION} border-transparent bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-md shadow-amber-500/30 hover:from-amber-300 hover:to-amber-400`}
              >
                <FaHandHoldingHeart size={13} />
                Confirmar entrega
              </button>
              <button
                type="button"
                onClick={() => onGoToChat(request)}
                className={`${STACKED_ACTION} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
              >
                <FaComments size={13} />
                Ir para o chat
              </button>
            </div>
          )}

          {status === "AWAITING_DELIVERY" && (
            <div className="flex flex-col gap-2">
              <div className={`${STACKED_ACTION} border-transparent bg-amber-50 font-extrabold text-amber-700`}>
                <FaClock size={13} />
                Aguardando adotante
              </div>
              <button
                type="button"
                onClick={() => onGoToChat(request)}
                className={`${STACKED_ACTION} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}
              >
                <FaComments size={13} />
                Ir para o chat
              </button>
            </div>
          )}

          {isConcluded && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-extrabold text-emerald-700">
              <FaCircleCheck size={13} />
              Adoção Concluída
            </div>
          )}

          {hasReturn && <ReturnInfo request={request} viewer="owner" />}

          {canWithdraw && (
            <button
              type="button"
              onClick={() => onWithdraw(request)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-400 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-600"
            >
              <FaBan size={11} />
              Desistir da adoção
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceivedRequestCard;
