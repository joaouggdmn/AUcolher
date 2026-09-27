import { useId } from 'react'

// Mesmo limite da bio no cadastro de ONG (OngRegisterFields)
const DEFAULT_MAX_LENGTH = 500

function TextAreaField({
  id: idProp,
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  rows = 4,
  maxLength = DEFAULT_MAX_LENGTH,
}) {
  const generatedId = useId()
  const id = idProp ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:ring-4 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10'
        }`}
      />
      <div className="flex items-start justify-between gap-3 text-xs text-slate-400">
        {error ? <span className="font-medium text-rose-600">{error}</span> : <span>{hint}</span>}
        <span className="shrink-0">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

export default TextAreaField
