import { FaCircleCheck, FaTriangleExclamation } from 'react-icons/fa6'
import { maskCEP } from '../../utils/masks'

function CepField({ cep, status, errorMessage, onChange, label = 'CEP', required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-ink-700">{label}</label>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={maskCEP(cep)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          required={required}
          className={`min-h-12 w-full rounded-control border bg-white px-4 pr-10 text-sm text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:ring-4 ${
            status === 'error'
              ? 'border-danger-600 focus:ring-danger-600/10'
              : 'border-line-strong focus:border-brand-600 focus:ring-brand-600/10'
          }`}
        />

        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
          {status === 'loading' && (
            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-600" />
          )}
          {status === 'success' && <FaCircleCheck size={16} className="text-brand-600" />}
          {status === 'error' && <FaTriangleExclamation size={15} className="text-danger-600" />}
        </span>
      </div>

      {status === 'loading' && <p className="text-xs font-medium text-ink-500">Buscando CEP...</p>}
      {status === 'error' && errorMessage && <p className="text-xs font-medium text-danger-600">{errorMessage}</p>}
      {status === 'success' && <p className="text-xs font-medium text-brand-600">Endereço encontrado!</p>}
    </div>
  )
}

export default CepField