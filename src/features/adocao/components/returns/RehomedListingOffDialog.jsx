import { createPortal } from 'react-dom'
import { FaCircleQuestion } from 'react-icons/fa6'

// Tirar do ar um anúncio republicado: na API é só INACTIVE, e o repasse
// continua valendo. Se a pessoa desistiu de doar e ficou com o animal, o
// certo é desfazer o repasse (regras §3.3) — então a tela pergunta
function RehomedListingOffDialog({ animalName, isProcessing, error, onKeptAnimal, onJustHide, onCancel }) {
  const handleCancel = () => {
    if (!isProcessing) onCancel()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={handleCancel} aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rehomed-off-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <FaCircleQuestion size={22} />
          </span>
          <div>
            <h3 id="rehomed-off-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              Por que tirar {animalName} do ar?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Este anúncio é de um animal que você adotou e republicou. Se você decidiu ficar com ele, a adoção volta a
              contar como concluída.
            </p>
          </div>

          {error && (
            <p role="alert" className="w-full rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onKeptAnimal}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
            >
              {isProcessing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isProcessing ? 'Salvando...' : 'Fiquei com o animal'}
            </button>
            <button
              type="button"
              onClick={onJustHide}
              disabled={isProcessing}
              className="rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors duration-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Doei por fora / só tirar do ar
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50 disabled:opacity-50"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RehomedListingOffDialog
