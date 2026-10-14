import { Link } from "react-router-dom";
import { FaXmark, FaBan } from "react-icons/fa6";
import Avatar from "../../../core/components/ui/Avatar";
import { animalDisplayName } from "../utils/requestAnimal";

const REJECTED_META = {
  label: "Recusado",
  icon: FaXmark,
  className: "bg-slate-100 text-slate-500",
};

const CANCELLED_CLASS = "bg-slate-100 text-slate-400";

// Por que o pedido foi cancelado, do ponto de vista do dono do animal.
// ACCOUNT_BANNED e LISTING_REMOVED vêm da moderação (regras §8)
const CANCEL_LABELS = {
  ANIMAL_ADOPTED: "Cancelado — pet adotado por outra pessoa",
  ADOPTER_WITHDREW: "Cancelado — o adotante desistiu",
  OWNER_WITHDREW: "Cancelado — você desistiu",
  ANIMAL_UNAVAILABLE: "Cancelado — anúncio fora do ar",
  ACCOUNT_BANNED: "Cancelado — conta suspensa",
  LISTING_REMOVED: "Cancelado — anúncio removido",
};

function metaOf(request) {
  if (request.status === "REJECTED") return REJECTED_META;
  return {
    label: CANCEL_LABELS[request.cancelReason] ?? "Cancelado",
    icon: FaBan,
    className: CANCELLED_CLASS,
  };
}

function ResolvedRequestRow({ request }) {
  const meta = metaOf(request);
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <Avatar name={request.adopter.name} photoUrl={request.adopter.photoUrl} className="h-10 w-10 text-sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-emerald-950">
          {request.adopter.name}
        </p>
        <p className="truncate text-xs text-slate-500">
          Interesse em{" "}
          <Link
            to={`/animais/${request.animal.id}`}
            className="font-semibold text-emerald-700 hover:underline"
          >
            {animalDisplayName(request.animal)}
          </Link>
        </p>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
      >
        <Icon size={10} />
        {meta.label}
      </span>
    </div>
  );
}

export default ResolvedRequestRow;
