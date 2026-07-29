// src/core/components/ui/filters/PillToggleGroup.jsx
function PillToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value || 'todos'}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
              isActive
                ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default PillToggleGroup