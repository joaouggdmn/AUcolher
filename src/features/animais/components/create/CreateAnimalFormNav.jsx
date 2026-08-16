import { FaArrowLeft, FaArrowRight, FaPaw } from 'react-icons/fa6'

function CreateAnimalFormNav({ isFirstStep, isLastStep, isStepValid, isSubmitting, onBack, onNext, onSubmit }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-slate-500 transition-all duration-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0"
      >
        <FaArrowLeft size={13} />
        Voltar
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isStepValid || isSubmitting}
          className="flex items-center gap-2 rounded-full bg-emerald-800 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 disabled:pointer-events-none disabled:opacity-40"
        >
          <FaPaw size={14} />
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Pet'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!isStepValid}
          className="flex items-center gap-2 rounded-full bg-emerald-800 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 disabled:pointer-events-none disabled:opacity-40"
        >
          Próximo
          <FaArrowRight size={13} />
        </button>
      )}
    </div>
  )
}

export default CreateAnimalFormNav