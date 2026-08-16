import { FaCircleCheck } from 'react-icons/fa6'
import { LuSparkles, LuCircle } from 'react-icons/lu'

function ProfileCompletionBar({ checklist, percentage }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-900 p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <LuSparkles size={13} />
            Completude do perfil
          </span>
          <p className="mt-2 max-w-md text-sm text-emerald-100/80">
            Complete seu perfil para o AUmatch encontrar o pet ideal mais rápido!
          </p>
        </div>
        <span className="font-serif text-4xl font-black text-amber-300">{percentage}%</span>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {checklist.map((item) => (
          <span
            key={item.key}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              item.isComplete ? 'text-white' : 'text-emerald-100/45'
            }`}
          >
            {item.isComplete ? (
              <FaCircleCheck size={13} className="text-amber-400" />
            ) : (
              <LuCircle size={12} />
            )}
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ProfileCompletionBar