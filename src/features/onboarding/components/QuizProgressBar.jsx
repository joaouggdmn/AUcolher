import { FaChevronLeft } from 'react-icons/fa6'

function QuizProgressBar({ currentStep, totalSteps, onBack }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 0}
        aria-label="Voltar"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-0"
      >
        <FaChevronLeft size={14} />
      </button>

      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 transition-all duration-500 ease-out ${
                index <= currentStep ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizProgressBar