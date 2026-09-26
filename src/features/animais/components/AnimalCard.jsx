import { Link } from "react-router-dom";
import {
  FaShieldHalved,
  FaVenus,
  FaMars,
  FaLocationDot,
  FaArrowRight,
  FaPaw,
  FaLocationCrosshairs,
} from "react-icons/fa6";
import { useAuth } from "../../../core/context/AuthContext";
import FavoriteButton from "../../../core/components/ui/FavoriteButton";

function AnimalCard({ animal }) {
  const { user } = useAuth();
  const isFemale = animal.sex === "F";
  const isNgo = animal.listingType === "NGO";
  const isOwner = !!user && user.id === animal.ownerId;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-emerald-950/15 ${
        isNgo
          ? "shadow-lg shadow-amber-500/10 ring-2 ring-amber-400"
          : "shadow-sm ring-1 ring-slate-100"
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Link to={`/animais/${animal.id}`}>
          <img
            src={animal.photoUrl}
            alt={`Foto de ${animal.name}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </Link>

        {/* 🆕 Selo de ONG compacto: só o escudo, com o texto no tooltip —
            mesma altura do coração à direita, deixando a foto limpa */}
        {isNgo && (
          <span
            role="img"
            aria-label="ONG Verificada"
            title="ONG Verificada"
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-md shadow-amber-500/30"
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
            <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">
              {animal.name}
            </h3>
            <p className="text-sm text-slate-500">
              {animal.breed} · {animal.ageLabel}
            </p>
          </div>

          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isFemale ? "bg-rose-50 text-rose-500" : "bg-sky-50 text-sky-500"
            }`}
            title={isFemale ? "Fêmea" : "Macho"}
          >
            {isFemale ? <FaVenus size={13} /> : <FaMars size={13} />}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <FaLocationDot size={13} className="text-emerald-600" />
          {animal.city}, {animal.state}
        </div>

        {Number.isFinite(animal.liveDistanceKm) && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <FaLocationCrosshairs size={10} />A{" "}
            {Math.round(animal.liveDistanceKm)} km de distância
          </span>
        )}

        {isNgo && animal.organizationName && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
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
            className="mt-auto flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-200 py-2.5 text-sm font-bold text-gray-500"
          >
            <FaPaw size={12} />
            Seu Pet
          </button>
        ) : (
          <Link
            to={`/animais/${animal.id}`}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-bold text-emerald-800 transition-all duration-300 group-hover:bg-emerald-800 group-hover:text-white"
          >
            Conhecer
            <FaArrowRight
              size={12}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

export default AnimalCard;
