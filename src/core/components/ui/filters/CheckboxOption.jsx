import { FaCheck } from 'react-icons/fa6'

function CheckboxOption({ label, checked, onChange }) {
  return (
    <label className="group flex cursor-pointer select-none items-center gap-3 py-1.5">
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
        <span className="absolute inset-0 rounded-md border-2 border-slate-300 bg-white transition-all duration-200 peer-checked:border-emerald-700 peer-checked:bg-emerald-700" />
        <FaCheck
          size={10}
          className="pointer-events-none relative z-10 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
        />
      </span>
      <span className="text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-emerald-800">
        {label}
      </span>
    </label>
  )
}

export default CheckboxOption