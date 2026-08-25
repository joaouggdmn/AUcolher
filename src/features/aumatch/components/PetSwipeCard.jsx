import { useState } from 'react'
import { FaShieldHalved, FaLocationDot, FaDna, FaPaw } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { useAuth } from '../../../core/context/AuthContext'

const STACK_TRANSFORM = ['', 'translate-y-3 scale-[0.96] opacity-90', 'translate-y-6 scale-[0.92] opacity-70']

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
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const isNgo = pet.listingType === 'NGO'
  const isOwner = !!user && user.id === pet.ownerId

  if (!isFront) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem] shadow-lg shadow-emerald-950/10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isNgo ? 'ring-2 ring-amber-400' : 'ring-1 ring-white/10'
        } ${STACK_TRANSFORM[stackIndex]}`}
        style={{ zIndex: 30 - stackIndex }}
      >
        <img src={pet.photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
    )
  }

  const liftY = isHovered && !isDragging ? -8 : 0

  return (
    <div
      className={`absolute inset-0 z-30 flex cursor-grab touch-none select-none flex-col overflow-hidden rounded-[2rem] shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:shadow-emerald-950/30 active:cursor-grabbing ${
        isNgo ? 'ring-2 ring-amber-400' : 'ring-1 ring-white/10'
      }`}
      style={{
        transform: `translate(${dragX}px, ${liftY}px) rotate(${rotation}deg)`,
        transition: isDragging
          ? 'none'
          : 'transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s cubic-bezier(0.4,0,0.2,1)',
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

      <div className="absolute left-5 top-5 z-10 flex flex-col items-start gap-2">
        {isNgo && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30">
            <FaShieldHalved size={12} />
            ONG Verificada
          </span>
        )}
        {isOwner && (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg backdrop-blur-sm">
            <FaPaw size={11} className="text-amber-300" />
            Seu Pet
          </span>
        )}
      </div>

      {dragDirection && (
        <div
          className={`absolute top-8 z-10 rounded-xl border-4 px-4 py-1.5 text-2xl font-black uppercase tracking-wider ${
            dragDirection === 'right'
              ? 'right-6 rotate-12 border-amber-400 text-amber-400'
              : 'left-6 -rotate-12 border-slate-200 text-slate-100'
          }`}
          style={{ opacity: labelOpacity }}
        >
          {dragDirection === 'right' ? 'Curtir' : 'Passar'}
        </div>
      )}

      {typeof pet.matchScore === 'number' && !dragDirection && (
        <span className="absolute right-5 top-5 z-10 flex items-center gap-1.5 rounded-full bg-emerald-800/90 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 backdrop-blur-sm">
          <LuSparkles size={12} className="text-amber-300" />
          {pet.matchScore}% match
        </span>
      )}

      <div className="relative z-10 mt-auto flex flex-col gap-1.5 p-6 text-white">
        <div className="flex items-baseline gap-2">
          <h2 className="font-serif text-3xl font-black drop-shadow-sm">{pet.name}</h2>
          <span className="text-lg font-medium text-white/80">{pet.ageLabel}</span>
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

        <p className="mt-1 line-clamp-3 text-sm text-white/85">{pet.summary}</p>
      </div>
    </div>
  )
}

export default PetSwipeCard