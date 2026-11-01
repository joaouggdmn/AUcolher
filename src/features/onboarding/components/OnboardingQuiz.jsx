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
    isCurrentAnswered,
    isLastStep,
    isSubmitting,
    submitError,
    handleSelect,
    handleNext,
    handleBack,
    handleSubmit,
  } = useOnboardingQuiz(onComplete)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-modal bg-white p-6 shadow-modal sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors duration-300 hover:bg-sand hover:text-ink-600"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col gap-4 pr-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-300/60 bg-accent-50 px-3.5 py-1 text-xs font-semibold text-accent-700">
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

        {currentQuestion.multiple && !isLastStep && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className="group flex items-center justify-center gap-2 rounded-full bg-brand-700 py-3.5 font-bold text-white shadow-lg  transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-40"
          >
            Continuar
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}

        {isLastStep && submitError && (
          <p role="alert" className="rounded-control bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
            {submitError}
          </p>
        )}

        {isLastStep && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isCurrentAnswered || isSubmitting}
            className="group flex items-center justify-center gap-2 rounded-full bg-brand-700 py-3.5 font-bold text-white shadow-lg  transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-40"
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