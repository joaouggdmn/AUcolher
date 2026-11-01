import { FaCheck } from 'react-icons/fa6'

// Card de UMA opção. Usado pelo QuizQuestionCard (quiz em modal) e pelo
// LifestyleForm (edição do perfil) — os dois passam description, então ela
// é renderizada aqui quando existe
function QuizOptionCard({ label, description, icon: Icon, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`group relative flex flex-col items-center gap-3 rounded-card border-2 p-6 text-center transition-all duration-300 ${
        isSelected
          ? 'border-accent-400 bg-brand-50 shadow-md '
          : 'border-line bg-white hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:'
      }`}
    >
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-400 text-brand-950">
          <FaCheck size={10} />
        </span>
      )}

      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors duration-300 ${
          isSelected ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100'
        }`}
      >
        {Icon && <Icon size={24} />}
      </span>

      <div>
        <span className={`block text-sm font-bold ${isSelected ? 'text-brand-950' : 'text-ink-700'}`}>
          {label}
        </span>
        {description && <span className="mt-0.5 block text-[11px] font-medium text-ink-500">{description}</span>}
      </div>
    </button>
  )
}

export default QuizOptionCard
