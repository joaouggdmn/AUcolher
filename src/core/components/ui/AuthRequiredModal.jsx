import { FaLock, FaXmark } from 'react-icons/fa6'

function AuthRequiredModal({ message, onCancel, onLogin }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-modal bg-white p-6 shadow-modal sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors duration-300 hover:bg-sand hover:text-ink-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <FaLock size={20} />
          </span>

          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-brand-950">Conecte-se para continuar</h3>
            <p className="mt-1.5 text-sm text-ink-500">{message}</p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-control bg-brand-700 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-brand-800"
            >
              Fazer login
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-control py-3 text-sm font-semibold text-ink-600 transition-colors duration-200 hover:bg-paper"
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