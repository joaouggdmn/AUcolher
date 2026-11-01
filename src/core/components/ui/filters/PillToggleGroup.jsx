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
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              isActive
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-line bg-white text-ink-600 hover:border-brand-200'
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