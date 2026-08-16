const STEP_LABELS = ['Dados básicos', 'Saúde', 'Compatibilidade', 'Fotos e descrição']

function StepIndicator({ stepIndex }) {
  return (
    <div className="flex items-center">
      {STEP_LABELS.map((label, index) => {
        const isActive = index === stepIndex
        const isDone = index < stepIndex

        return (
          <div key={label} className="flex flex-1 items-center last:flex-initial">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-700 text-white'
                    : isActive
                    ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {index + 1}
              </span>
              <span className={`hidden text-center text-[11px] font-semibold sm:block ${isActive ? 'text-emerald-900' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>

            {index < STEP_LABELS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 transition-colors duration-500 ${isDone ? 'bg-emerald-600' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator