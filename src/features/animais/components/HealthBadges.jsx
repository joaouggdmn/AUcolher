import { FaSyringe, FaScissors, FaPills, FaCircleCheck } from 'react-icons/fa6'

const HEALTH_ITEMS = [
  { key: 'vaccinated', label: 'Vacinado', icon: FaSyringe },
  { key: 'neutered', label: 'Castrado', icon: FaScissors },
  { key: 'dewormed', label: 'Vermifugado', icon: FaPills },
]

function HealthBadges({ animal }) {
  const activeItems = HEALTH_ITEMS.filter((item) => animal[item.key])

  if (activeItems.length === 0) return null

  return (
    <div className="rounded-2xl bg-emerald-50/70 p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">Saúde e cuidados</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {activeItems.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white">
              <Icon size={12} />
            </span>
            {label}
            <FaCircleCheck size={13} className="text-amber-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HealthBadges