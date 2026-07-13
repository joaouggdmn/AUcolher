import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

function AuthInput({ id, label, type = 'text', icon: Icon, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="group relative flex items-center">
        <Icon
          className="pointer-events-none absolute left-4 text-slate-400 transition-colors duration-300 group-focus-within:text-emerald-600"
          size={17}
        />

        <input
          id={id}
          type={inputType}
          className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          {...props}
        />

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
    </div>
  )
}

export default AuthInput