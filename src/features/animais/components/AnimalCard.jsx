import { Link } from "react-router-dom";
import {
  FaShieldHalved,
  FaVenus,
  FaMars,
  FaLocationDot,
  FaArrowRight,
  FaPaw,
} from "react-icons/fa6";
import { useAuth } from "../../../core/context/AuthContext";
import FavoriteButton from "../../../core/components/ui/FavoriteButton";

function AnimalCard({ animal }) {
  const { user } = useAuth();
  const isFemale = animal.sex === "FEMALE";
  const isNgo = animal.listingType === "NGO";
  const isOwner = !!user && user.id === animal.ownerId;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-card border bg-white transition-colors duration-200 ${
        isNgo
          ? "border-accent-300 hover:border-accent-500"
          : "border-line hover:border-line-strong"
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Link to={`/animais/${animal.id}`}>
          <img
            src={animal.photoUrl}
            alt={`Foto de ${animal.name}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </Link>

        {/* 🆕 Selo de ONG compacto: só o escudo, com o texto no tooltip —
            mesma altura do coração à direita, deixando a foto limpa */}
        {isNgo && (
          <span
            role="img"
            aria-label="ONG Verificada"
            title="ONG Verificada"
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent-300 text-brand-950"
          >
            <FaShieldHalved size={14} />
          </span>
        )}

        <FavoriteButton
          animalId={animal.id}
          animalName={animal.name}
          className="absolute right-3 top-3 h-9 w-9"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-brand-950">
              {animal.name}
            </h3>
            <p className="text-sm text-ink-500">
              {animal.breed} · {animal.ageLabel}
            </p>
          </div>

          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-ink-600"
            title={isFemale ? "Fêmea" : "Macho"}
          >
            {isFemale ? <FaVenus size={13} /> : <FaMars size={13} />}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-ink-500">
          <FaLocationDot size={13} className="text-brand-600" />
          {animal.city}, {animal.state}
        </div>

        {isNgo && animal.organizationName && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-700">
            <FaShieldHalved size={11} />
            {animal.organizationName}
          </p>
        )}

        {/* 🆕 Área de ação: botão condicional. O dono nunca vê o CTA de
            "Conhecer" habilitado no seu próprio anúncio. */}
        {isOwner ? (
          <button
            type="button"
            disabled
            className="mt-auto flex cursor-not-allowed items-center justify-center gap-2 rounded-control bg-sand py-2.5 text-sm font-bold text-ink-500"
          >
            <FaPaw size={12} />
            Seu Pet
          </button>
        ) : (
          <Link
            to={`/animais/${animal.id}`}
            className="mt-auto flex items-center justify-center gap-2 rounded-control bg-brand-50 py-2.5 text-sm font-bold text-brand-700 transition-colors duration-200 group-hover:bg-brand-700 group-hover:text-white"
          >
            Conhecer
            <FaArrowRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default AnimalCard;
