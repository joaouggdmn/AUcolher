// `error` troca a dica por uma mensagem em vermelho e destaca o campo
function FormField({ label, hint, error, className = '', ...inputProps }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-ink-700">{label}</label>
      <input
        aria-invalid={error ? true : undefined}
        className={`min-h-12 w-full rounded-control border bg-white px-4 text-sm text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-500 focus:ring-4 disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-500 ${
          error
            ? 'border-danger-600 focus:ring-danger-600/10'
            : 'border-line-strong focus:border-brand-600 focus:ring-brand-600/10'
        }`}
        {...inputProps}
      />
      {error ? (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-ink-500">{hint}</p>
      )}
    </div>
  )
}

export default FormField
