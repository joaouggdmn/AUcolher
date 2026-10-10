import { FaTriangleExclamation, FaXmark } from 'react-icons/fa6'

// Confirmação de uma ação que não dá para desfazer. Enquanto `isConfirming`
// espera a API, os botões ficam travados e o fundo não fecha o modal
function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isConfirming = false,
}) {
  const handleCancel = () => {
    if (!isConfirming) onCancel()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={handleCancel} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={isConfirming}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <FaTriangleExclamation size={20} />
          </span>

          <div>
            <h3 id="confirm-modal-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">{message}</p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
            >
              {isConfirming && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirming}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
