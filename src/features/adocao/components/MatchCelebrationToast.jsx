import { useNavigate } from 'react-router-dom'
import { FaXmark, FaComments } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'

function MatchCelebrationToast({ adopterName, onClose }) {
  const navigate = useNavigate()

  if (!adopterName) return null

  const handleGoToChat = () => {
    navigate('/chat', { state: { adopterName } })
    onClose()
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[110] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md animate-fade-slide-in items-start gap-3 rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-900 p-4 pr-3 text-white shadow-2xl shadow-emerald-950/40 ring-1 ring-amber-400/30 sm:items-center">
        <span className="flex h-11 w-11 shrink-0 animate-wiggle items-center justify-center rounded-full bg-amber-400 text-emerald-950">
          <LuSparkles size={20} />
        </span>

        <div className="flex-1">
          <p className="text-sm font-bold leading-snug">
            Interesse aceito! O chat com <span className="text-amber-300">{adopterName}</span> está liberado.
          </p>
          <button
            type="button"
            onClick={handleGoToChat}
            className="mt-2 flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-extrabold text-emerald-950 transition-all duration-300 hover:bg-amber-300"
          >
            <FaComments size={12} />
            Ir para o chat
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0 rounded-full p-1.5 text-emerald-200/70 transition-colors duration-300 hover:bg-white/10 hover:text-white"
        >
          <FaXmark size={14} />
        </button>
      </div>
    </div>
  )
}

export default MatchCelebrationToast