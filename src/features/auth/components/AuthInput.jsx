import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

// prefix: texto fixo antes do valor (ex: "@" das redes sociais)
// trailing: indicador à direita (ex: status da busca de CNPJ)
// hint/error: texto abaixo do campo — error tem prioridade e pinta a borda
function AuthInput({ id, label, type = 'text', icon: Icon, prefix, trailing, hint, error, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const paddingLeft = prefix ? 'pl-[3.65rem]' : Icon ? 'pl-11' : 'pl-4'
  const paddingRight = isPassword || trailing ? 'pr-11' : 'pr-4'
  const borderClasses = error
    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
    : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="group relative flex items-center">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 text-slate-400 transition-colors duration-300 group-focus-within:text-emerald-600"
            size={17}
          />
        )}

        {prefix && (
          <span className="pointer-events-none absolute left-11 text-sm font-semibold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          className={`min-h-12 w-full rounded-xl border bg-white ${paddingLeft} ${paddingRight} text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:ring-4 ${borderClasses}`}
          {...props}
        />

        {trailing && <span className="pointer-events-none absolute right-4">{trailing}</span>}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 text-slate-400 transition-colors duration-300 hover:text-emerald-600"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
}

export default AuthInput
