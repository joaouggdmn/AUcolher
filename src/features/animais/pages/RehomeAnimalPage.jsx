import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaArrowLeft } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useAuth } from '../../../core/context/AuthContext'
import { mockHttpError } from '../../../core/services/mock/mockStore'
import { getErrorMessage } from '../../../core/utils/apiError'
import { isSameId } from '../../../core/utils/ids'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import Spinner from '../../../core/components/ui/Spinner'
import ReturnReasonFields from '../../adocao/components/returns/ReturnReasonFields'
import { animalDisplayName } from '../../adocao/utils/requestAnimal'
import { canHaveReturn, isReturnReasonValid } from '../../adocao/utils/requestStatus'
import PanelNotice from '../../ong/panel/PanelNotice'
import AnimalFormWizard from '../components/create/AnimalFormWizard'
import { useAnimalForm } from '../hooks/useAnimalForm'
import { MY_ANIMALS_ADOPTED_PATH } from '../utils/myAnimalsPaths'

const BACK = { backTo: MY_ANIMALS_ADOPTED_PATH, backLabel: 'Voltar para Adotados por mim' }

function PageFrame({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <Link
        to={MY_ANIMALS_ADOPTED_PATH}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
      >
        <FaArrowLeft size={12} />
        Meus animais
      </Link>
      <div className="mb-8 flex flex-col items-center gap-1.5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Republicar anúncio
        </span>
        <h1 className="text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="max-w-lg text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// O formulário só monta com o rascunho carregado: ele nasce preenchido
function RehomeForm({ request, draft, reasonFields }) {
  const navigate = useNavigate()
  const { rehome } = useAdoptionRequests()

  const form = useAnimalForm({
    draft,
    submitLabels: { idle: 'Publicar anúncio', busy: 'Publicando...' },
    onSubmit: (formData, photos) => {
      // O motivo fica no topo da página, fora das etapas do formulário
      if (!isReturnReasonValid(reasonFields)) {
        throw mockHttpError(400, 'Escolha o motivo do repasse, no começo da página.')
      }
      return rehome(request.id, { ...reasonFields, form: formData, photos })
    },
    onSaved: (updated) =>
      navigate(`/animais/${updated.returnInfo?.rehomedAnimalId ?? ''}`, { state: { justCreated: true } }),
  })

  return <AnimalFormWizard form={form} />
}

// /meus-animais/republicar/:requestId — o adotante anuncia de novo um animal
// que adotou (regras §3.3). Nasce um anúncio novo em nome dele, cópia do
// original, que ele revisa com o que aprendeu convivendo com o animal; a
// adoção vira REHOMED e conta na taxa de reabandono
function RehomeAnimalPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const { requests, isLoading, getRehomeDraft } = useAdoptionRequests()
  const [reasonFields, setReasonFields] = useState({ reason: '', note: '' })

  const request = requests.find((candidate) => isSameId(candidate.id, requestId)) ?? null
  const isMine = request != null && isSameId(request.adopter?.userId, user?.id)
  const canRehome = isMine && request.status === 'CONCLUDED' && canHaveReturn(request)

  const draftQuery = useQuery({
    queryKey: ['adocao', 'rehome-draft', String(requestId)],
    queryFn: () => getRehomeDraft(request.id),
    enabled: canRehome,
    staleTime: Infinity,
    retry: false,
  })

  if (isLoading) {
    return (
      <PageFrame title="Republicar anúncio">
        <Spinner />
      </PageFrame>
    )
  }
  if (!isMine) {
    return (
      <PageFrame title="Republicar anúncio">
        <PanelNotice {...BACK}>Não encontramos esta adoção entre as suas. Só quem adotou pode republicar o animal.</PanelNotice>
      </PageFrame>
    )
  }

  const animalName = animalDisplayName(request.animal)
  if (request.status === 'RETURNED') {
    return (
      <PageFrame title={`Republicar ${animalName}`}>
        <PanelNotice {...BACK}>{animalName} já voltou para quem doou, então não dá para republicar.</PanelNotice>
      </PageFrame>
    )
  }
  if (request.status === 'REHOMED') {
    return (
      <PageFrame title={`Republicar ${animalName}`}>
        <PanelNotice {...BACK}>Você já anunciou {animalName} para uma nova adoção.</PanelNotice>
      </PageFrame>
    )
  }
  if (!canRehome) {
    return (
      <PageFrame title={`Republicar ${animalName}`}>
        <PanelNotice {...BACK}>Só uma adoção concluída pode ser republicada.</PanelNotice>
      </PageFrame>
    )
  }

  let formContent
  if (draftQuery.isLoading) {
    formContent = <Spinner />
  } else if (draftQuery.error) {
    formContent = (
      <LoadErrorState
        title="Não foi possível carregar o anúncio original"
        message={getErrorMessage(draftQuery.error)}
        onRetry={() => draftQuery.refetch()}
      />
    )
  } else {
    formContent = <RehomeForm request={request} draft={draftQuery.data} reasonFields={reasonFields} />
  }

  return (
    <PageFrame
      title={`Encontrar um novo lar para ${animalName}`}
      subtitle="O anúncio já vem preenchido com os dados de quando você adotou. Revise o que mudou, principalmente o comportamento: você conhece o animal melhor do que ninguém agora."
    >
      <section className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-extrabold tracking-tight text-emerald-950">Por que você vai repassar?</h2>
        <p className="mb-5 text-sm text-slate-500">
          Só a equipe da AUcolher e quem doou {animalName} para você veem o motivo. Ele ajuda a medir e reduzir o reabandono.
        </p>
        <ReturnReasonFields
          reason={reasonFields.reason}
          note={reasonFields.note}
          onChange={setReasonFields}
          idPrefix={`rehome-${request.id}`}
        />
      </section>

      {formContent}
    </PageFrame>
  )
}

export default RehomeAnimalPage
