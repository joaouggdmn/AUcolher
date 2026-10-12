import { useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import AnimalFormWizard from '../components/create/AnimalFormWizard'
import { useAnimalForm } from '../hooks/useAnimalForm'

function CreateAnimalPage() {
  const navigate = useNavigate()
  const form = useAnimalForm({
    onSaved: (animal) => navigate(`/animais/${animal.id}`, { state: { justCreated: true } }),
  })

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Cadastrar animal para adoção
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
          Vamos encontrar uma família para esse pet
        </h1>
      </div>

      <AnimalFormWizard form={form} />
    </div>
  )
}

export default CreateAnimalPage
