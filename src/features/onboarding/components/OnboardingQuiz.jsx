import { LuSparkles } from 'react-icons/lu'
import { FaXmark, FaArrowRight } from 'react-icons/fa6'
import QuizProgressBar from './QuizProgressBar'
import QuizQuestionCard from './QuizQuestionCard'
import { useOnboardingQuiz } from '../hooks/useOnboardingQuiz'

function OnboardingQuiz({ isOpen, onClose, onComplete }) {
  const {
    currentStep,
    totalSteps,
    direction,
    currentQuestion,
    selectedValue,
    isLastStep,
    isSubmitting,
    handleSelect,
    handleBack,
    handleSubmit,
  } = useOnboardingQuiz(onComplete)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-600"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col gap-4 pr-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-3.5 py-1 text-xs font-semibold text-amber-700">
            <LuSparkles size={13} />
            Vamos personalizar seus matches
          </span>

          <QuizProgressBar currentStep={currentStep} totalSteps={totalSteps} onBack={handleBack} />
        </div>

        {/* overflow-hidden corta o slide horizontal; key={currentStep} força
            remontagem a cada pergunta, disparando a animação de entrada */}
        <div className="overflow-hidden">
          <div
            key={currentStep}
            className={direction === 'forward' ? 'animate-quiz-slide-forward' : 'animate-quiz-slide-backward'}
          >
            <QuizQuestionCard question={currentQuestion} selectedValue={selectedValue} onSelect={handleSelect} />
          </div>
        </div>

        {isLastStep && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedValue === undefined || isSubmitting}
            className="group flex items-center justify-center gap-2 rounded-full bg-emerald-800 py-3.5 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 disabled:pointer-events-none disabled:opacity-40"
          >
            {isSubmitting ? 'Preparando seus matches...' : 'Concluir e ver meus Matches'}
            {!isSubmitting && <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default OnboardingQuiz