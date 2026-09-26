import { useId } from 'react'

// Mesmo limite da bio no cadastro de ONG (OngRegisterFields)
const DEFAULT_MAX_LENGTH = 500

function TextAreaField({ label, value, onChange, placeholder, hint, rows = 4, maxLength = DEFAULT_MAX_LENGTH }) {
  const id = useId()

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
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
      />
      <div className="flex items-start justify-between gap-3 text-xs text-slate-400">
        <span>{hint}</span>
        <span className="shrink-0">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

export default TextAreaField
