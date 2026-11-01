import { LuBrainCircuit } from 'react-icons/lu'
import { LEVEL_FIELD_META, TEMPERAMENT_META, COMPATIBILITY_META } from '../utils/behaviorMeta'
import LevelIndicator from './LevelIndicator'
import CompatibilityTag from './CompatibilityTag'

function BehaviorProfile({ animal }) {
  const temperamentMeta = TEMPERAMENT_META[animal.temperament]

  return (
    <div className="rounded-card bg-brand-50/60 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
          <LuBrainCircuit size={14} />
          Comportamento e estilo de vida
        </h3>

        {temperamentMeta && (
          <span className="flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1.5 text-xs font-extrabold text-brand-950 shadow-sm ">
            <temperamentMeta.icon size={12} />
            {temperamentMeta.label}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {Object.entries(LEVEL_FIELD_META).map(([key, meta]) => (
          <LevelIndicator key={key} icon={meta.icon} label={meta.label} value={animal[key]} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-brand-100 pt-5">
        {Object.entries(COMPATIBILITY_META).map(([key, meta]) => (
          <CompatibilityTag key={key} icon={meta.icon} label={meta.label} value={animal[key]} />
        ))}
      </div>
    </div>
  )
}

export default BehaviorProfile