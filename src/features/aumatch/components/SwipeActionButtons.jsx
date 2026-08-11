import { FaXmark, FaCircleInfo, FaHeart } from 'react-icons/fa6'

function SwipeActionButtons({ onPass, onLike, onInfo, isTopOng, disabled }) {
  return (
    <div className="relative z-40 -mt-7 flex items-center justify-center gap-5">
      <button
        type="button"
        onClick={onPass}
        disabled={disabled}
        aria-label="Passar"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-400 shadow-xl shadow-emerald-950/15 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:text-rose-500 disabled:pointer-events-none disabled:opacity-40"
      >
        <FaXmark size={26} />
      </button>

      <button
        type="button"
        onClick={onInfo}
        disabled={disabled}
        aria-label="Ver detalhes"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-lg shadow-emerald-950/10 ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
      >
        <FaCircleInfo size={18} />
      </button>

      {/* Brilho dourado extra no hover só quando o pet da frente é de ONG verificada */}
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        aria-label="Curtir"
        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-xl shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:pointer-events-none disabled:opacity-40 ${
          isTopOng ? 'hover:shadow-[0_0_28px_6px_rgba(217,119,6,0.5)]' : 'hover:shadow-amber-500/50'
        }`}
      >
        <FaHeart size={24} />
      </button>
    </div>
  )
}

export default SwipeActionButtons