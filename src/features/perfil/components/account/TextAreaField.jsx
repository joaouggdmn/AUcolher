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
      <label htmlFor={id} className="text-sm font-semibold text-ink-700">
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
        className={`w-full resize-none rounded-control border bg-white px-4 py-3 text-sm leading-relaxed text-ink-900 outline-none transition-all duration-300 placeholder:text-ink-500 focus:ring-4 ${
          error
            ? 'border-danger-600/30 focus:border-danger-600 focus:ring-danger-600/10'
            : 'border-line focus:border-brand-600 focus:ring-brand-600/10'
        }`}
      />
      <div className="flex items-start justify-between gap-3 text-xs text-ink-500">
        {error ? <span className="font-medium text-danger-600">{error}</span> : <span>{hint}</span>}
        <span className="shrink-0">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}

export default TextAreaField
