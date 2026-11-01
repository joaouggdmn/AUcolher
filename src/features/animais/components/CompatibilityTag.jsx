import { FaCheck, FaXmark } from 'react-icons/fa6'

function CompatibilityTag({ icon: Icon, label, value }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-control px-3 py-2 text-xs font-semibold ${
        value ? 'bg-white text-brand-700' : 'bg-white/50 text-ink-500'
      }`}
    >
      <Icon size={13} className={value ? 'text-brand-600' : 'text-line-strong'} />
      <span className="flex-1">{label}</span>
      {value ? <FaCheck size={11} className="text-brand-600" /> : <FaXmark size={11} className="text-line-strong" />}
    </div>
  )
}

export default CompatibilityTag