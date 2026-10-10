// `error` troca a dica por uma mensagem em vermelho e destaca o campo
function FormField({ label, hint, error, className = '', ...inputProps }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        aria-invalid={error ? true : undefined}
        className={`min-h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-600/10'
        }`}
        {...inputProps}
      />
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
}

export default FormField
