import { createPortal } from 'react-dom'
import { FaCircleQuestion } from 'react-icons/fa6'

const VARIANTS = {
  default: {
    icon: 'bg-amber-50 text-amber-500',
    confirm: 'bg-emerald-800 hover:bg-emerald-900',
  },
  danger: {
    icon: 'bg-rose-50 text-rose-500',
    confirm: 'bg-rose-600 hover:bg-rose-700',
  },
}

// Confirmação genérica (mesmo visual do ConfirmAdoptionModal). Enquanto
// `isProcessing`, nada fecha o diálogo; `error` mostra a recusa da API sem
// fechar, para a pessoa tentar de novo ou desistir. Vai por portal para o
// <body>: dentro de um ancestral animado (transform) o `fixed` ficaria preso
// a ele em vez de cobrir a tela
function ConfirmDialog({
  icon: Icon = FaCircleQuestion,
  title,
  description,
  confirmLabel,
  processingLabel = 'Processando...',
  cancelLabel = 'Voltar',
  variant = 'default',
  isProcessing = false,
  error,
  onConfirm,
  onCancel,
}) {
  const styles = VARIANTS[variant]
  const handleCancel = () => {
    if (!isProcessing) onCancel()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={handleCancel} aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full ${styles.icon}`}>
            <Icon size={22} />
          </span>

          <div>
            <h3 id="confirm-dialog-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              {title}
            </h3>
            <div className="mt-1.5 text-sm text-slate-500">{description}</div>
          </div>

          {error && (
            <p role="alert" className="w-full rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-wait disabled:opacity-70 ${styles.confirm}`}
            >
              {isProcessing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isProcessing ? processingLabel : confirmLabel}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDialog
