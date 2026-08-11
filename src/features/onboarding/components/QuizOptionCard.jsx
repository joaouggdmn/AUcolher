import { FaCheck } from 'react-icons/fa6'

function QuizOptionCard({ label, icon: Icon, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-300 ${
        isSelected
          ? 'border-amber-400 bg-emerald-50 shadow-md shadow-emerald-900/5'
          : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5'
      }`}
    >
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-emerald-950">
          <FaCheck size={10} />
        </span>
      )}

      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors duration-300 ${
          isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
        }`}
      >
        <Icon size={24} />
      </span>

      <span className={`text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-700'}`}>
        {label}
      </span>
    </button>
  )
}

export default QuizOptionCard