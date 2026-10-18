import { FaDna, FaHeart, FaLocationDot, FaXmark } from 'react-icons/fa6'
import { LuLightbulb, LuSparkles } from 'react-icons/lu'
import PetPhoto from './PetPhoto'
import NgoShield from './NgoShield'

// Cartas de trás paradas, só para sugerir o deck
const BACK_CARD_STYLES = [
  '-translate-x-4 -rotate-[4deg] scale-[0.94] opacity-70',
  'translate-x-4 rotate-[4deg] scale-[0.94] opacity-45',
]

// Mesmo selo numerado dos passos da "Adoção segura": liga cada parte do
// card à legenda com o mesmo número
function Marker({ number, className = '' }) {
  return (
    <span
      className={`absolute z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-emerald-950 shadow-md shadow-amber-500/30 ring-4 ring-stone-50 ${className}`}
    >
      {number}
    </span>
  )
}

// Réplica estática do PetSwipeCard: nada arrasta, nada é clicável. O
// desenho é decorativo (aria-hidden). Os selos 1, 2 e 3 (showMarkers) só
// fazem sentido ao lado das legendas do hero da home. className define a
// largura; a altura vem da proporção do card
function AumatchCardMockup({ pet, backPhotos, showMarkers = true, className = 'w-72 sm:w-80' }) {
  return (
    <div aria-hidden="true" className={`relative shrink-0 select-none ${className}`}>
      <div className="relative">
        {backPhotos.map((photo, index) => (
          <div
            key={photo}
            className={`absolute inset-0 overflow-hidden rounded-[2rem] bg-emerald-900 shadow-lg shadow-emerald-950/10 ${BACK_CARD_STYLES[index]}`}
          >
            <PetPhoto src={photo} width={480} className="h-full w-full" />
          </div>
        ))}

        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-emerald-900 shadow-2xl shadow-emerald-950/25 ring-2 ring-amber-400">
          <PetPhoto src={pet.photoUrl} width={640} eager className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

          <NgoShield decorative className="absolute left-4 top-4" />

          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-800/90 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/30 backdrop-blur-sm">
            <LuSparkles size={12} className="text-amber-300" />
            <span className="tabular-nums">{pet.matchScore}% match</span>
            <LuLightbulb size={13} className="text-amber-300" />
          </span>

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-5 pb-10 text-white">
            <p className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight drop-shadow-sm">{pet.name}</span>
              <span className="text-base font-medium text-white/80">{pet.ageLabel}</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <span className="flex items-center gap-1.5">
                <FaDna size={12} />
                {pet.breed}
              </span>
              <span className="flex items-center gap-1.5">
                <FaLocationDot size={12} />
                {pet.city}, {pet.state}
              </span>
            </p>
            <p className="line-clamp-2 text-sm leading-snug text-white/85">{pet.summary}</p>
          </div>
        </div>

        {showMarkers && (
          <>
            <Marker number={1} className="-left-3 -top-3" />
            <Marker number={2} className="-right-3 -top-3" />
          </>
        )}
      </div>

      {/* Os mesmos botões de swipe do AUmatch, apoiados na borda do card */}
      <div className="relative z-10 -mt-7 flex justify-center gap-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-400 shadow-lg shadow-emerald-950/15 ring-1 ring-black/5">
          <FaXmark size={20} />
        </span>
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-lg shadow-amber-500/30">
          <FaHeart size={19} />
          {showMarkers && <Marker number={3} className="-right-3 -top-3" />}
        </span>
      </div>
    </div>
  )
}

export default AumatchCardMockup
