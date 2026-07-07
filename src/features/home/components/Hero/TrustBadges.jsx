import { FaCircleCheck, FaShieldHalved, FaHeart } from 'react-icons/fa6'

const badges = [
  { icon: FaCircleCheck, label: 'ONGs e protetores verificados' },
  { icon: FaShieldHalved, label: 'Processo de adoção seguro' },
  { icon: FaHeart, label: '+500 adoções concluídas' },
]

function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Icon className="text-amber-500" />
          {label}
        </div>
      ))}
    </div>
  )
}

export default TrustBadges