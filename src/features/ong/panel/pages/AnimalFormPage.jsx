import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../../core/context/AuthContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { isSameId } from '../../../../core/utils/ids'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import AnimalFormWizard from '../../../animais/components/create/AnimalFormWizard'
import { useAnimal } from '../../../animais/hooks/useAnimais'
import { useAnimalForm } from '../../../animais/hooks/useAnimalForm'
import PanelFormPage from '../PanelFormPage'
import PanelNotice from '../PanelNotice'
import { PANEL_PATHS } from '../panelPaths'

const BACK = { backTo: PANEL_PATHS.animals, backLabel: 'Voltar para animais' }

function gendered(animal, male, female) {
  return animal.sex === 'FEMALE' ? female : male
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
    <PanelFormPage title="Cadastrar animal" description="Quanto mais completo o anúncio, mais fácil encontrar a família certa." {...BACK}>
      <AnimalFormWizard form={form} />
    </PanelFormPage>
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
    <PanelFormPage title={`Editar ${animal.name}`} description="As mudanças aparecem na vitrine assim que você salvar." {...BACK}>
      <AnimalFormWizard form={form} />
    </PanelFormPage>
  )
}

function EditAnimalLoader({ id }) {
  const { user } = useAuth()
  const { data: animal, isLoading, error, refetch } = useAnimal(id)

  if (isLoading) {
    return (
      <PanelFormPage title="Editar animal" {...BACK}>
        <Spinner />
      </PanelFormPage>
    )
  }
  if (error) {
    const notFound = error.response?.status === 404
    return (
      <PanelFormPage title="Editar animal" {...BACK}>
        <LoadErrorState
          title={notFound ? 'Animal não encontrado' : 'Não foi possível carregar o animal'}
          message={notFound ? 'Ele pode ter sido removido.' : getErrorMessage(error)}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </PanelFormPage>
    )
  }
  if (!isSameId(animal.ownerId, user?.id)) {
    return (
      <PanelFormPage title="Editar animal" {...BACK}>
        <PanelNotice {...BACK}>Este animal não é da sua ONG: só quem anunciou pode editar.</PanelNotice>
      </PanelFormPage>
    )
  }
  if (animal.status === 'ADOPTED') {
    return (
      <PanelFormPage title={`Editar ${animal.name}`} {...BACK}>
        <PanelNotice {...BACK}>
          {animal.name} já foi {gendered(animal, 'adotado', 'adotada')}. O anúncio fica como histórico e não pode mais ser
          editado.
        </PanelNotice>
      </PanelFormPage>
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
