import { FaLock, FaXmark } from 'react-icons/fa6'

function AuthRequiredModal({ message, onCancel, onLogin }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <FaLock size={20} />
          </span>

          <div>
            <h3 className="font-serif text-lg font-bold text-emerald-950">Conecte-se para continuar</h3>
            <p className="mt-1.5 text-sm text-slate-500">{message}</p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
            >
              Fazer login
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthRequiredModal