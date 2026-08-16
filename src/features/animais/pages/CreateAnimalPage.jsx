import { LuSparkles } from 'react-icons/lu'
import StepIndicator from '../components/create/StepIndicator'
import StepBasicInfo from '../components/create/StepBasicInfo'
import StepHealth from '../components/create/StepHealth'
import StepCompatibility from '../components/create/StepCompatibility'
import StepMedia from '../components/create/StepMedia'
import CreateAnimalFormNav from '../components/create/CreateAnimalFormNav'
import { useCreateAnimalForm } from '../hooks/useCreateAnimalForm'

const STEP_CONTENT = {
  basic: { title: 'Dados básicos', subtitle: 'Vamos começar com o essencial sobre o pet.' },
  health: { title: 'Cuidados e saúde', subtitle: 'Essas informações passam confiança para o adotante.' },
  compatibility: { title: 'Perfil de compatibilidade', subtitle: 'Isso alimenta o algoritmo do AUmatch.' },
  media: { title: 'Fotos e descrição', subtitle: 'A parte que mais encanta quem está procurando um pet.' },
}

function CreateAnimalPage() {
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
    isSubmitting,
    goNext,
    goBack,
    handleSubmit,
  } = useCreateAnimalForm()

  const { title, subtitle } = STEP_CONTENT[currentStep]

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Cadastrar animal para adoção
        </span>
        <h1 className="font-serif text-2xl font-black text-emerald-950 sm:text-3xl">
          Vamos encontrar uma família para esse pet
        </h1>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <StepIndicator stepIndex={stepIndex} />
        </div>

        <div key={currentStep} className="animate-fade-slide-in">
          <div className="mb-6">
            <h2 className="font-serif text-lg font-bold text-emerald-950">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          {currentStep === 'basic' && <StepBasicInfo formData={formData} onChange={updateField} />}
          {currentStep === 'health' && <StepHealth formData={formData} onChange={updateField} />}
          {currentStep === 'compatibility' && <StepCompatibility formData={formData} onChange={updateField} />}
          {currentStep === 'media' && (
            <StepMedia formData={formData} onChange={updateField} images={images} setImages={setImages} />
          )}
        </div>

        <div className="mt-8">
          <CreateAnimalFormNav
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isStepValid={isStepValid}
            isSubmitting={isSubmitting}
            onBack={goBack}
            onNext={goNext}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateAnimalPage