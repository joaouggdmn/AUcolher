import { FaTriangleExclamation, FaXmark } from 'react-icons/fa6'

// Aparece quando a pessoa tenta sair de "Minha conta" (inclusive pelo
// botão "Meu perfil público") com alterações pendentes. Enquanto o
// "Salvar e continuar" espera a API, os botões ficam travados
function LeaveConfirmModal({ onSave, onDiscard, onStay, isSaving = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onStay} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-confirm-title"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onStay}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <FaTriangleExclamation size={20} />
          </span>

          <div>
            <h3 id="leave-confirm-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              Salvar antes de sair?
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Você editou seu perfil e ainda não salvou. Se sair agora, o perfil público continua com a versão anterior.
            </p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar e continuar'}
            </button>
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="rounded-xl py-3 text-sm font-bold text-rose-600 transition-colors duration-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descartar alterações
            </button>
            <button
              type="button"
              onClick={onStay}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
            >
              Continuar editando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveConfirmModal
