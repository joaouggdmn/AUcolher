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
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adopters-only-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-modal bg-white p-6 shadow-modal sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors duration-300 hover:bg-sand hover:text-ink-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <FaHeart size={20} />
          </span>

          <div>
            <h3 id="adopters-only-title" className="text-lg font-extrabold tracking-tight text-brand-950">
              O AUmatch é para quem quer adotar
            </h3>
            <p className="mt-1.5 text-sm text-ink-500">
              Contas de ONG e de administração veem esta prévia, mas curtir e responder o quiz é só para pessoas
              físicas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-control bg-brand-700 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdoptersOnlyModal
