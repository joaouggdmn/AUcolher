import { FaArrowLeft, FaArrowRight, FaFloppyDisk, FaPaw } from 'react-icons/fa6'

const PRIMARY_BUTTON =
  'flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-800 px-5 py-3 sm:px-7 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900 disabled:pointer-events-none disabled:opacity-40'
const SECONDARY_BUTTON =
  'flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40'

// No cadastro só a última etapa salva. Na edição o anúncio já está completo,
// então "Salvar alterações" aparece em todas as etapas
function CreateAnimalFormNav({ isFirstStep, isLastStep, isStepValid, isFormValid, isEditing, isSubmitting, onBack, onNext, onSubmit }) {
  const submitLabel = isEditing
    ? isSubmitting ? 'Salvando...' : 'Salvar alterações'
    : isSubmitting ? 'Cadastrando...' : 'Cadastrar Pet'

  const submitButton = (
    <button type="button" onClick={onSubmit} disabled={!isFormValid || isSubmitting} className={PRIMARY_BUTTON}>
      {isEditing ? <FaFloppyDisk size={14} /> : <FaPaw size={14} />}
      {submitLabel}
    </button>
  )

  const nextButton = (
    <button type="button" onClick={onNext} disabled={!isStepValid} className={isEditing ? SECONDARY_BUTTON : PRIMARY_BUTTON}>
      Próximo
      <FaArrowRight size={13} />
    </button>
  )

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
      {!isFirstStep && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold text-slate-500 transition-all duration-300 hover:bg-slate-50"
        >
          <FaArrowLeft size={13} />
          Voltar
        </button>
      )}

      <div className="ml-auto flex flex-wrap justify-end gap-2">
        {!isLastStep && nextButton}
        {(isLastStep || isEditing) && submitButton}
      </div>
    </div>
  )
}

export default CreateAnimalFormNav
