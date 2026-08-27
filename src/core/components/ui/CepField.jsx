import { FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6'
import { maskCEP } from '../../utils/masks'

function CepField({ cep, status, errorMessage, onChange, label = 'CEP' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={maskCEP(cep)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          className={`min-h-12 w-full rounded-xl border bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:ring-4 ${
            status === 'error'
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
              : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10'
          }`}
        />

        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
          {status === 'loading' && (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
          )}
          {status === 'success' && <FaCircleCheck size={16} className="text-emerald-600" />}
          {status === 'error' && <FaTriangleExclamation size={15} className="text-rose-500" />}
        </span>
      </div>

      {status === 'loading' && <p className="text-xs font-medium text-slate-400">Buscando CEP...</p>}
      {status === 'error' && errorMessage && <p className="text-xs font-medium text-rose-600">{errorMessage}</p>}
      {status === 'success' && <p className="text-xs font-medium text-emerald-600">Endereço encontrado!</p>}
    </div>
  )
}

export default CepField