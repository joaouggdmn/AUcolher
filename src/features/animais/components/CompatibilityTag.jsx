import { FaCheck, FaXmark } from 'react-icons/fa6'

function CompatibilityTag({ icon: Icon, label, value }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
        value ? 'bg-white text-emerald-800' : 'bg-white/50 text-slate-400'
      }`}
    >
      <Icon size={13} className={value ? 'text-emerald-600' : 'text-slate-300'} />
      <span className="flex-1">{label}</span>
      {value ? <FaCheck size={11} className="text-emerald-600" /> : <FaXmark size={11} className="text-slate-300" />}
    </div>
  )
}

export default CompatibilityTag