import { LEVEL_LABELS, LEVEL_STEPS } from '../utils/behaviorMeta'

function LevelIndicator({ icon: Icon, label, value }) {
  const activeSteps = LEVEL_STEPS[value] ?? 0

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-emerald-900">{label}</span>
          <span className="font-bold text-amber-600">{LEVEL_LABELS[value] ?? '—'}</span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                step <= activeSteps ? 'bg-amber-400' : 'bg-emerald-100'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LevelIndicator