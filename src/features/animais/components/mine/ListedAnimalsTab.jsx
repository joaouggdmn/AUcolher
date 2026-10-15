import { useState } from 'react'
import { FaCircleCheck, FaPaw, FaPlus } from 'react-icons/fa6'
import { useAdoptionRequests } from '../../../../core/context/AdoptionRequestContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import ReturnInfo from '../../../adocao/components/ReturnInfo'
import OwnerReturnButton from '../../../adocao/components/returns/OwnerReturnButton'
import OwnerReturnDialogs from '../../../adocao/components/returns/OwnerReturnDialogs'
import { RETURN_STATUSES, ownerReturnRequestFor } from '../../../adocao/utils/requestStatus'
import { useChangeAnimalStatus, useMyAnimals } from '../../hooks/useAnimais'
import { LISTING_STATUS_META, withAdoptionStatus } from '../../utils/listingStatus'
import OwnerAnimalRow from '../owner/OwnerAnimalRow'

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'INACTIVE', 'ADOPTED', 'REMOVED']

const SUCCESS_MESSAGES = {
  AVAILABLE: ({ name }) => `${name} voltou para a vitrine.`,
  INACTIVE: ({ name }) => `${name} saiu do ar. Dá para colocar de volta quando quiser.`,
  ADOPTED: ({ name, sex }) => `Que notícia boa! ${name} foi ${sex === 'FEMALE' ? 'marcada como adotada' : 'marcado como adotado'}.`,
}

// "Meus animais" → Anunciados por mim: os anúncios da pessoa em qualquer
// status, com as mesmas ações do painel da ONG (editar, tirar do ar,
// reativar, marcar como adotado) e, nos adotados, o "Animal retornado".
// `onNotify` mostra o aviso de sucesso
function ListedAnimalsTab({ onNotify }) {
  const { data: animals = [], isLoading, error, refetch } = useMyAnimals()
  const { requests } = useAdoptionRequests()
  const [statusFilter, setStatusFilter] = useState('')
  const [adoptionCandidate, setAdoptionCandidate] = useState(null)
  const [statusError, setStatusError] = useState(null)
  const [returningRequest, setReturningRequest] = useState(null)
  const { mutate: changeStatus, isPending, variables } = useChangeAnimalStatus()

  const handleChangeStatus = (animal, status) => {
    setStatusError(null)
    changeStatus(
      { id: animal.id, status },
      {
        onSuccess: () => {
          setAdoptionCandidate(null)
          onNotify(SUCCESS_MESSAGES[status](animal))
        },
        onError: (changeError) => {
          setAdoptionCandidate(null)
          setStatusError(getErrorMessage(changeError))
        },
      }
    )
  }

  if (isLoading) return <Spinner />
  if (error) {
    return (
      <LoadErrorState
        title="Não foi possível carregar seus anúncios"
        message={getErrorMessage(error)}
        onRetry={() => refetch()}
      />
    )
  }
  if (animals.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaPaw}
        title="Você ainda não anunciou nenhum animal."
        description="Os animais que você anunciar aparecem aqui e, enquanto estiverem disponíveis, na vitrine e no seu perfil público."
        action={{ to: '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }}
      />
    )
  }

  const listed = withAdoptionStatus(animals, requests)
  const filterOptions = [
    { value: '', label: `Todos (${listed.length})` },
    ...STATUS_ORDER.map((key) => ({ key, count: listed.filter((animal) => animal.listingStatus === key).length }))
      .filter(({ count }) => count > 0)
      .map(({ key, count }) => ({ value: key, label: `${LISTING_STATUS_META[key].label} (${count})` })),
  ]
  const visible = listed.filter((animal) => !statusFilter || animal.listingStatus === statusFilter)
  const adoptedWord = adoptionCandidate?.sex === 'FEMALE' ? 'adotada' : 'adotado'

  return (
    <div className="flex flex-col gap-4">
      {filterOptions.length > 2 && (
        <PillToggleGroup options={filterOptions} value={statusFilter} onChange={setStatusFilter} />
      )}

      {statusError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {statusError}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Nenhum anúncio com esse status.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((animal) => {
            const adoption = ownerReturnRequestFor(animal, requests)
            return (
              <OwnerAnimalRow
                key={animal.id}
                animal={animal}
                editTo={(row) => `/animais/editar/${row.id}`}
                requestsTo="/interesses-recebidos"
                pendingStatus={isPending && variables?.id === animal.id ? variables.status : null}
                onChangeStatus={handleChangeStatus}
                onMarkAdopted={setAdoptionCandidate}
                details={
                  adoption && RETURN_STATUSES.includes(adoption.status) ? (
                    <div className="mt-2">
                      <ReturnInfo request={adoption} viewer="owner" />
                    </div>
                  ) : null
                }
              >
                {adoption && <OwnerReturnButton request={adoption} onOpen={setReturningRequest} />}
              </OwnerAnimalRow>
            )
          })}
        </ul>
      )}

      {returningRequest && (
        <OwnerReturnDialogs
          request={returningRequest}
          editTo={(animalId) => `/animais/editar/${animalId}`}
          onNotify={onNotify}
          onClose={() => setReturningRequest(null)}
        />
      )}

      {adoptionCandidate && (
        <ConfirmDialog
          icon={FaCircleCheck}
          title={`${adoptionCandidate.name} foi ${adoptedWord}?`}
          description="Essa ação é definitiva: o anúncio sai da vitrine e do seu perfil público e não pode mais ser editado nem voltar ao ar."
          confirmLabel={`Sim, foi ${adoptedWord}`}
          processingLabel="Salvando..."
          isProcessing={isPending}
          onConfirm={() => handleChangeStatus(adoptionCandidate, 'ADOPTED')}
          onCancel={() => setAdoptionCandidate(null)}
        />
      )}
    </div>
  )
}

export default ListedAnimalsTab
