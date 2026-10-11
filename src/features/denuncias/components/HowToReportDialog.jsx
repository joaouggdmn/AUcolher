import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { FaFlag, FaXmark } from 'react-icons/fa6'

const STEPS = [
  'Entre na sua conta.',
  'Abra o anúncio do animal ou o perfil da pessoa ou ONG.',
  'Toque em "Denunciar", escolha o motivo e conte o que aconteceu.',
]

// "Como denunciar", aberto pelo rodapé: a denúncia é feita no próprio
// anúncio ou perfil, então aqui só explica o caminho
function HowToReportDialog({ onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-report-title"
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md animate-fade-slide-in overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <FaFlag size={20} />
          </span>
          <h3 id="how-to-report-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
            Como denunciar
          </h3>
          <p className="text-sm text-slate-500">
            Viu um anúncio ou perfil suspeito? A denúncia é feita na própria página dele.
          </p>
        </div>

        <ol className="mt-6 flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          A equipe do AUcolher analisa cada denúncia e pode remover o anúncio ou suspender a conta. Se um animal
          estiver sofrendo maus-tratos agora, procure também a polícia ou a delegacia de proteção animal da sua cidade.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            to="/animais"
            onClick={onClose}
            className="rounded-xl bg-emerald-800 py-3 text-center text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            Ver anúncios
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default HowToReportDialog
