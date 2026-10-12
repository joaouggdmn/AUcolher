import { Link } from "react-router-dom";
import { FaXmark, FaBan } from "react-icons/fa6";
import Avatar from "../../../core/components/ui/Avatar";
import { animalDisplayName } from "../utils/requestAnimal";

const STATUS_META = {
  REJECTED: {
    label: "Recusado",
    icon: FaXmark,
    className: "bg-slate-100 text-slate-500",
  },
  CANCELLED: {
    label: "Cancelado — pet já adotado",
    icon: FaBan,
    className: "bg-slate-100 text-slate-400",
  },
};

// Cancelado por uma decisão da moderação (regras §8)
const MODERATION_META = {
  ACCOUNT_BANNED: { ...STATUS_META.CANCELLED, label: "Cancelado — conta suspensa" },
  LISTING_REMOVED: { ...STATUS_META.CANCELLED, label: "Cancelado — anúncio removido" },
};

function ResolvedRequestRow({ request }) {
  const meta = MODERATION_META[request.cancelReason] ?? STATUS_META[request.status];
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
          {request.animalSource === "api" ? (
            <Link
              to={`/animais/${request.animal.id}`}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {animalDisplayName(request.animal)}
            </Link>
          ) : (
            <span className="font-semibold text-slate-600">{animalDisplayName(request.animal)}</span>
          )}
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
