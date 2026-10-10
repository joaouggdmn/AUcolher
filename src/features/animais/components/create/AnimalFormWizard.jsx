import StepIndicator from './StepIndicator'
import StepBasicInfo from './StepBasicInfo'
import StepHealth from './StepHealth'
import StepCompatibility from './StepCompatibility'
import StepMedia from './StepMedia'
import CreateAnimalFormNav from './CreateAnimalFormNav'

const STEP_CONTENT = {
  basic: { title: 'Dados básicos', subtitle: 'Vamos começar com o essencial sobre o pet.' },
  health: { title: 'Cuidados e saúde', subtitle: 'Essas informações passam confiança para o adotante.' },
  compatibility: { title: 'Perfil de compatibilidade', subtitle: 'Isso alimenta o algoritmo do AUmatch.' },
  media: { title: 'Fotos e descrição', subtitle: 'A parte que mais encanta quem está procurando um pet.' },
}

// O formulário em etapas do anúncio. `form` é o retorno de useAnimalForm:
// quem chama decide se cadastra ou edita e para onde vai depois de salvar
function AnimalFormWizard({ form }) {
  const {
    stepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    formData,
    images,
    setImages,
    updateField,
    isStepValid,
    isFormValid,
    isEditing,
    isSubmitting,
    goNext,
    goBack,
    goToStep,
    handleSubmit,
    submitError,
    needsLocationInput,
  } = form

  const { title, subtitle } = STEP_CONTENT[currentStep]

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8">
        <StepIndicator stepIndex={stepIndex} onSelect={isEditing ? goToStep : undefined} />
      </div>

      <div key={currentStep} className="animate-fade-slide-in">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        {currentStep === 'basic' && <StepBasicInfo formData={formData} onChange={updateField} showLocationFields={needsLocationInput} />}
        {currentStep === 'health' && <StepHealth formData={formData} onChange={updateField} />}
        {currentStep === 'compatibility' && <StepCompatibility formData={formData} onChange={updateField} />}
        {currentStep === 'media' && (
          <StepMedia formData={formData} onChange={updateField} images={images} setImages={setImages} />
        )}
      </div>

      {submitError && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {submitError}
        </p>
      )}

      <div className="mt-8">
        <CreateAnimalFormNav
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isStepValid={isStepValid}
          isFormValid={isFormValid}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
          onBack={goBack}
          onNext={goNext}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default AnimalFormWizard
