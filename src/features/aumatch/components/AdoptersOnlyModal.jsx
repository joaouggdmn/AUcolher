import { useEffect } from 'react'
import { FaHeart, FaXmark } from 'react-icons/fa6'

// ONG e admin veem o deck só como prévia: curtir e responder o quiz é de
// quem quer adotar (a API do AUmatch recusa as outras contas)
function AdoptersOnlyModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adopters-only-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <FaHeart size={20} />
          </span>

          <div>
            <h3 id="adopters-only-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              O AUmatch é para quem quer adotar
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Contas de ONG e de administração veem esta prévia, mas curtir e responder o quiz é só para pessoas
              físicas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdoptersOnlyModal
