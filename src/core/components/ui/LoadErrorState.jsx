import { FaTriangleExclamation, FaRotateRight } from 'react-icons/fa6'

// Falha ao buscar dados (rede, servidor fora do ar). `message` costuma vir
// de getErrorMessage(error)
function LoadErrorState({ title = 'Não foi possível carregar', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/40 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <FaTriangleExclamation size={22} />
      </span>
      <div>
        <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          <FaRotateRight size={13} />
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export default LoadErrorState
