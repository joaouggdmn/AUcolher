function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>

      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors duration-300 peer-checked:bg-emerald-700" />
        <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export default ToggleSwitch