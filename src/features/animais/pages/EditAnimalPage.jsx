import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import { isSameId } from '../../../core/utils/ids'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import PanelNotice from '../../ong/panel/PanelNotice'
import { PANEL_PATHS } from '../../ong/panel/panelPaths'
import AnimalFormWizard from '../components/create/AnimalFormWizard'
import { useAnimal } from '../hooks/useAnimais'
import { useAnimalForm } from '../hooks/useAnimalForm'
import { MY_ANIMALS_PATH } from '../utils/myAnimalsPaths'

const BACK = { backTo: MY_ANIMALS_PATH, backLabel: 'Voltar para Meus animais' }

function gendered(animal, male, female) {
  return animal.sex === 'FEMALE' ? female : male
}

function PageFrame({ title, children }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Link
        to={MY_ANIMALS_PATH}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
      >
        <FaArrowLeft size={12} />
        Meus animais
      </Link>
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Editar anúncio
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{title}</h1>
      </div>
      {children}
    </div>
  )
}

// Montado só depois que o animal carregou: o formulário nasce com os dados dele
function EditAnimalForm({ animal }) {
  const navigate = useNavigate()
  const form = useAnimalForm({
    animal,
    onSaved: (saved) => navigate(MY_ANIMALS_PATH, { state: { flash: `Alterações em ${saved.name} salvas.` } }),
  })

  return (
    <PageFrame title={`Editar ${animal.name}`}>
      <AnimalFormWizard form={form} />
    </PageFrame>
  )
}

// /animais/editar/:id — edição do anúncio de pessoa física. A ONG edita pelo
// painel, então cai lá; a API recusaria o PUT de quem não é dono (403), aqui
// só evita o formulário inútil
function EditAnimalPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: animal, isLoading, error, refetch } = useAnimal(id)

  if (user?.userType === 'ONG') return <Navigate to={PANEL_PATHS.animalEdit(id)} replace />

  if (isLoading) {
    return (
      <PageFrame title="Editar animal">
        <Spinner />
      </PageFrame>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PageFrame title="Editar animal">
        <LoadErrorState
          title={notFound ? 'Animal não encontrado' : 'Não foi possível carregar o animal'}
          message={notFound ? 'Ele pode ter sido removido.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PageFrame>
    )
  }
  if (!isSameId(animal.ownerId, user?.id)) {
    return (
      <PageFrame title="Editar animal">
        <PanelNotice {...BACK}>Este anúncio não é seu: só quem anunciou pode editar.</PanelNotice>
      </PageFrame>
    )
  }
  if (animal.status === 'ADOPTED') {
    return (
      <PageFrame title={`Editar ${animal.name}`}>
        <PanelNotice {...BACK}>
          {animal.name} já foi {gendered(animal, 'adotado', 'adotada')}. O anúncio fica como histórico e não pode mais ser
          editado.
        </PanelNotice>
      </PageFrame>
    )
  }

  return <EditAnimalForm key={animal.id} animal={animal} />
}

export default EditAnimalPage
