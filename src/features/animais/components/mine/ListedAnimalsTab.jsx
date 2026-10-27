import { useState } from 'react'
import { FaBullhorn, FaPaw, FaPlus } from 'react-icons/fa6'
import { useAdoptionRequests } from '../../../../core/context/AdoptionRequestContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import LoadErrorState from '../../../../core/components/ui/LoadErrorState'
import Spinner from '../../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import ReturnInfo from '../../../adocao/components/ReturnInfo'
import OwnerReturnButton from '../../../adocao/components/returns/OwnerReturnButton'
import OwnerReturnDialogs from '../../../adocao/components/returns/OwnerReturnDialogs'
import RehomedListingOffDialog from '../../../adocao/components/returns/RehomedListingOffDialog'
import { originRequestIdOf } from '../../../adocao/services/adocaoService'
import { RETURN_STATUSES, ownerReturnRequestFor } from '../../../adocao/utils/requestStatus'
import { isSameId } from '../../../../core/utils/ids'
import { useChangeAnimalStatus, useMyAnimals } from '../../hooks/useAnimais'
import { LISTING_STATUS_META, withAdoptionStatus } from '../../utils/listingStatus'
import OwnerAnimalRow from '../owner/OwnerAnimalRow'

const STATUS_ORDER = ['AVAILABLE', 'IN_PROGRESS', 'INACTIVE', 'ADOPTED', 'REMOVED']

const SUCCESS_MESSAGES = {
  AVAILABLE: ({ name }) => `${name} voltou para a vitrine.`,
  INACTIVE: ({ name }) => `${name} saiu do ar. Dá para colocar de volta quando quiser.`,
}

// "Meus animais" → Anunciados por mim: os anúncios da pessoa em qualquer
// status, com as mesmas ações do painel da ONG (editar, tirar do ar,
// reativar) e, nos adotados, o "Animal retornado".
// Tirar do ar um anúncio republicado pergunta se a pessoa ficou com o animal
// (aí o repasse é desfeito) ou só quer tirar o anúncio do ar.
// `onNotify` mostra o aviso de sucesso
function ListedAnimalsTab({ onNotify }) {
  const { data: animals = [], isLoading, error, refetch } = useMyAnimals()
  const { requests, undoRehome } = useAdoptionRequests()
  const [statusFilter, setStatusFilter] = useState('')
  const [statusError, setStatusError] = useState(null)
  const [returningRequest, setReturningRequest] = useState(null)
  // Anúncio republicado saindo do ar: { animal, requestId }
  const [hidingRehomed, setHidingRehomed] = useState(null)
  const [isUndoing, setIsUndoing] = useState(false)
  const [undoError, setUndoError] = useState(null)
  const { mutate: changeStatus, isPending, variables } = useChangeAnimalStatus()

  const handleChangeStatus = (animal, status) => {
    setStatusError(null)
    changeStatus(
      { id: animal.id, status },
      {
        onSuccess: () => {
          onNotify(SUCCESS_MESSAGES[status](animal))
        },
        onError: (changeError) => {
          setStatusError(getErrorMessage(changeError))
        },
      }
    )
  }

  // A adoção REHOMED de onde veio o anúncio, enquanto o repasse vale
  const rehomedOriginOf = (animal) => {
    const originId = originRequestIdOf(animal)
    if (originId == null) return null
    return requests.find((request) => isSameId(request.id, originId) && request.status === 'REHOMED') ?? null
  }

  const requestChangeStatus = (animal, status) => {
    const origin = status === 'INACTIVE' ? rehomedOriginOf(animal) : null
    if (!origin) {
      handleChangeStatus(animal, status)
      return
    }
    setUndoError(null)
    setHidingRehomed({ animal, requestId: origin.id })
  }

  const handleKeptAnimal = async () => {
    setIsUndoing(true)
    setUndoError(null)
    try {
      await undoRehome(hidingRehomed.requestId)
      onNotify(`Repasse desfeito: ${hidingRehomed.animal.name} continua com você e o anúncio saiu do ar.`)
      setHidingRehomed(null)
    } catch (keepError) {
      setUndoError(getErrorMessage(keepError, 'Não foi possível desfazer o repasse.'))
    } finally {
      setIsUndoing(false)
    }
  }

  const handleJustHide = () => {
    const { animal } = hidingRehomed
    setHidingRehomed(null)
    handleChangeStatus(animal, 'INACTIVE')
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
            const isRehomedListing = originRequestIdOf(animal) != null
            return (
              <OwnerAnimalRow
                key={animal.id}
                animal={animal}
                editTo={(row) => `/animais/editar/${row.id}`}
                requestsTo="/interesses-recebidos"
                pendingStatus={isPending && variables?.id === animal.id ? variables.status : null}
                onChangeStatus={requestChangeStatus}
                details={
                  <>
                    {isRehomedListing && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-sky-600">
                        <FaBullhorn size={9} />
                        Republicado de uma adoção sua
                      </p>
                    )}
                    {adoption && RETURN_STATUSES.includes(adoption.status) && (
                      <div className="mt-2">
                        <ReturnInfo request={adoption} viewer="owner" />
                      </div>
                    )}
                  </>
                }
              >
                {adoption && <OwnerReturnButton request={adoption} onOpen={setReturningRequest} />}
              </OwnerAnimalRow>
            )
          })}
        </ul>
      )}

      {hidingRehomed && (
        <RehomedListingOffDialog
          animalName={hidingRehomed.animal.name}
          isProcessing={isUndoing}
          error={undoError}
          onKeptAnimal={handleKeptAnimal}
          onJustHide={handleJustHide}
          onCancel={() => setHidingRehomed(null)}
        />
      )}

      {returningRequest && (
        <OwnerReturnDialogs
          request={returningRequest}
          editTo={(animalId) => `/animais/editar/${animalId}`}
          onNotify={onNotify}
          onClose={() => setReturningRequest(null)}
        />
      )}

    </div>
  )
}

export default ListedAnimalsTab
