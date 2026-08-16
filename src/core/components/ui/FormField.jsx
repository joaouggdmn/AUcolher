function FormField({ label, hint, className = '', ...inputProps }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        {...inputProps}
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default FormField  