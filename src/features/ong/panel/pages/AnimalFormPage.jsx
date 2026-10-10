import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaLock } from 'react-icons/fa6'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { isSameId } from '../../../../core/utils/ids'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import AnimalFormWizard from '../../../animais/components/create/AnimalFormWizard'
import { useAnimal } from '../../../animais/hooks/useAnimais'
import { useAnimalForm } from '../../../animais/hooks/useAnimalForm'
import PanelPage from '../PanelPage'
import { PANEL_PATHS } from '../panelPaths'

const BACK_ACTION = [{ to: PANEL_PATHS.animals, label: 'Voltar para animais', icon: FaArrowLeft }]

function gendered(animal, male, female) {
  return animal.sex === 'FEMALE' ? female : male
}

function FormLayout({ title, description, children }) {
  return (
    <PanelPage title={title} description={description} actions={BACK_ACTION} framed={false}>
      <div className="max-w-3xl">{children}</div>
    </PanelPage>
  )
}

function NewAnimalForm() {
  const navigate = useNavigate()
  const form = useAnimalForm({
    onSaved: (animal) =>
      navigate(PANEL_PATHS.animals, {
        state: { flash: `${animal.name} foi ${gendered(animal, 'cadastrado', 'cadastrada')} e já aparece na vitrine.` },
      }),
  })

  return (
    <FormLayout title="Cadastrar animal" description="Quanto mais completo o anúncio, mais fácil encontrar a família certa.">
      <AnimalFormWizard form={form} />
    </FormLayout>
  )
}

// Montado só depois que o animal carregou: o formulário nasce com os dados dele
function EditAnimalForm({ animal }) {
  const navigate = useNavigate()
  const form = useAnimalForm({
    animal,
    onSaved: (saved) => navigate(PANEL_PATHS.animals, { state: { flash: `Alterações em ${saved.name} salvas.` } }),
  })

  return (
    <FormLayout title={`Editar ${animal.name}`} description="As mudanças aparecem na vitrine assim que você salvar.">
      <AnimalFormWizard form={form} />
    </FormLayout>
  )
}

function Notice({ title, children }) {
  return (
    <FormLayout title={title}>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FaLock size={16} />
        </span>
        <p className="max-w-md text-sm text-slate-500">{children}</p>
        <Link to={PANEL_PATHS.animals} className="text-sm font-bold text-emerald-700 hover:underline">
          Voltar para animais
        </Link>
      </div>
    </FormLayout>
  )
}

function EditAnimalLoader({ id }) {
  const { user } = useAuth()
  const { data: animal, isLoading, error, refetch } = useAnimal(id)

  if (isLoading) {
    return (
      <FormLayout title="Editar animal">
        <Spinner />
      </FormLayout>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <FormLayout title="Editar animal">
        <LoadErrorState
          title={notFound ? 'Animal não encontrado' : 'Não foi possível carregar o animal'}
          message={notFound ? 'Ele pode ter sido removido.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </FormLayout>
    )
  }
  if (!isSameId(animal.ownerId, user?.id)) {
    return <Notice title="Editar animal">Este animal não é da sua ONG: só quem anunciou pode editar.</Notice>
  }
  if (animal.status === 'ADOPTED') {
    return (
      <Notice title={`Editar ${animal.name}`}>
        {animal.name} já foi {gendered(animal, 'adotado', 'adotada')}. O anúncio fica como histórico e não pode mais ser
        editado.
      </Notice>
    )
  }

  return <EditAnimalForm key={animal.id} animal={animal} />
}

// /ong/painel/animais/novo e /ong/painel/animais/:id/editar
function AnimalFormPage() {
  const { id } = useParams()
  return id ? <EditAnimalLoader id={id} /> : <NewAnimalForm />
}

export default AnimalFormPage
