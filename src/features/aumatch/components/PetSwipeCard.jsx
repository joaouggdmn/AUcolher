import { useState } from "react";
import { FaShieldHalved, FaLocationDot, FaDna } from "react-icons/fa6";

const STACK_TRANSFORM = [
  "",
  "translate-y-3 scale-[0.96] opacity-90",
  "translate-y-6 scale-[0.92] opacity-70",
];

function PetSwipeCard({
  pet,
  isFront,
  stackIndex = 0,
  dragBind,
  dragX = 0,
  rotation = 0,
  isDragging,
  dragDirection,
  labelOpacity = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isOng = pet.anunciante === "ONG";

  // Cards atrás só mostram uma fatia da foto (o resto fica coberto pelo
  // card da frente) — badge e texto ficariam escondidos mesmo, então nem renderizamos
  if (!isFront) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] shadow-lg shadow-emerald-950/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOng ? "ring-2 ring-amber-400" : "ring-1 ring-white/10"
        } ${STACK_TRANSFORM[stackIndex]}`}
        style={{ zIndex: 30 - stackIndex }}
      >
        <img src={pet.photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  const liftY = isHovered && !isDragging ? -8 : 0;

  return (
    <div
      className={`absolute inset-0 z-30 flex cursor-grab touch-none select-none flex-col overflow-hidden rounded-[2rem] shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:shadow-emerald-950/30 active:cursor-grabbing ${
        isOng ? "ring-2 ring-amber-400" : "ring-1 ring-white/10"
      }`}
      style={{
        transform: `translate(${dragX}px, ${liftY}px) rotate(${rotation}deg)`,
        // transform + box-shadow juntos aqui: inline style substitui QUALQUER
        // transition vinda de classe para este elemento, então precisam
        // estar listados nesta única declaração para animarem corretamente
        transition: isDragging
          ? "none"
          : "transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...dragBind}
    >
      <img
        src={pet.photoUrl}
        alt={pet.name}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {isOng && (
        <span className="absolute left-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30">
          <FaShieldHalved size={12} />
          ONG Verificada
        </span>
      )}

      {/* Selo de intenção — aparece gradualmente conforme o arraste se aproxima do limiar */}
      {dragDirection && (
        <div
          className={`absolute top-8 z-10 rounded-xl border-4 px-4 py-1.5 text-2xl font-black uppercase tracking-wider ${
            dragDirection === "right"
              ? "right-6 rotate-12 border-amber-400 text-amber-400"
              : "left-6 -rotate-12 border-slate-200 text-slate-100"
          }`}
          style={{ opacity: labelOpacity }}
        >
          {dragDirection === "right" ? "Curtir" : "Passar"}
        </div>
      )}

      <div className="relative z-10 mt-auto flex flex-col gap-1.5 p-6 text-white">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-3xl font-black drop-shadow-sm">
            {pet.name}
          </h2>
          <span className="text-lg font-medium text-white/80">
            {pet.ageLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
          <span className="flex items-center gap-1.5">
            <FaDna size={12} />
            {pet.breed}
          </span>
          <span className="flex items-center gap-1.5">
            <FaLocationDot size={12} />
            {pet.city}, {pet.state}
          </span>
        </div>

        <p className="mt-1 line-clamp-3 text-sm text-white/85">
          {pet.description}
        </p>
      </div>
    </div>
  );
}

export default PetSwipeCard;
