import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBullhorn, FaCircleCheck, FaHeart, FaRotateLeft } from 'react-icons/fa6'
import { useAdoptionRequests } from '../../../../core/context/AdoptionRequestContext'
import { useSentRequests } from '../../../../core/hooks/useSentRequests'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { isSameId } from '../../../../core/utils/ids'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import ActivityEmptyState from '../../../perfil/components/activity/ActivityEmptyState'
import ReturnInfo from '../../../adocao/components/ReturnInfo'
import { animalDisplayName } from '../../../adocao/utils/requestAnimal'
import { useMyAnimals } from '../../hooks/useAnimais'
import { rehomePath } from '../../utils/myAnimalsPaths'
import AdoptedAnimalCard from './AdoptedAnimalCard'

// "Meus animais" → Adotados por mim: as adoções que a pessoa concluiu,
// inclusive as que depois voltaram ao doador ou foram repassadas. Na
// concluída, "Republicar anúncio"; no repasse, "Desisti de doar" enquanto o
// anúncio novo não gerou outra adoção (regras §3.3)
function AdoptedAnimalsTab({ onNotify }) {
  const navigate = useNavigate()
  const { adoptedRequests } = useSentRequests()
  const { undoRehome } = useAdoptionRequests()
  const { data: myAnimals = [] } = useMyAnimals()
  const [undoing, setUndoing] = useState(null)
  const [isUndoing, setIsUndoing] = useState(false)
  const [undoError, setUndoError] = useState(null)

  const goToChat = (requestId) => navigate('/chat', { state: { requestId } })

  // O anúncio novo é da própria pessoa: vem em "Meus animais"
  const rehomedListingOf = (request) =>
    myAnimals.find((animal) => isSameId(animal.id, request.returnInfo?.rehomedAnimalId)) ?? null

  const openUndo = (request) => {
    setUndoError(null)
    setUndoing(request)
  }

  const handleConfirmUndo = async () => {
    setIsUndoing(true)
    setUndoError(null)
    try {
      await undoRehome(undoing.id)
      onNotify(`Repasse desfeito: ${animalDisplayName(undoing.animal)} continua com você e o anúncio saiu do ar.`)
      setUndoing(null)
    } catch (error) {
      setUndoError(getErrorMessage(error, 'Não foi possível desfazer o repasse.'))
    } finally {
      setIsUndoing(false)
    }
  }

  if (adoptedRequests.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaHeart}
        title="Você ainda não adotou nenhum animal pela AUcolher."
        description="Quando você confirmar a chegada de um pet pelo chat, a adoção aparece aqui."
        action={{ to: '/aumatch', label: 'Ir para o AUmatch' }}
      />
    )
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {adoptedRequests.map((request) => {
          const rehomedListing = request.status === 'REHOMED' ? rehomedListingOf(request) : null
          const canUndo = request.status === 'REHOMED' && rehomedListing?.status !== 'ADOPTED'

          return (
            <AdoptedAnimalCard key={request.id} request={request} onGoToChat={goToChat}>
              {request.status === 'CONCLUDED' && (
                <>
                  <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-extrabold text-emerald-700">
                    <FaCircleCheck size={13} />
                    Adoção concluída
                  </p>
                  <Link
                    to={rehomePath(request.id)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 py-2.5 text-sm font-bold text-sky-700 transition-all duration-300 hover:bg-sky-50"
                  >
                    <FaBullhorn size={12} />
                    Republicar anúncio
                  </Link>
                  <p className="text-center text-[11px] text-slate-400">
                    Não pode mais ficar com o animal? Anuncie para uma nova família.
                  </p>
                </>
              )}

              {request.status !== 'CONCLUDED' && <ReturnInfo request={request} viewer="adopter" />}

              {canUndo && (
                <button
                  type="button"
                  onClick={() => openUndo(request)}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-500 transition-colors duration-300 hover:bg-slate-50 hover:text-emerald-800"
                >
                  <FaRotateLeft size={11} />
                  Desisti de doar
                </button>
              )}
            </AdoptedAnimalCard>
          )
        })}
      </ul>

      {undoing && (
        <ConfirmDialog
          icon={FaRotateLeft}
          title={`Ficar com ${animalDisplayName(undoing.animal)}?`}
          description="O anúncio novo sai do ar (os pedidos que ele recebeu são cancelados) e a adoção volta a contar como concluída."
          confirmLabel="Sim, vou ficar com ele"
          processingLabel="Desfazendo..."
          isProcessing={isUndoing}
          error={undoError}
          onConfirm={handleConfirmUndo}
          onCancel={() => setUndoing(null)}
        />
      )}
    </>
  )
}

export default AdoptedAnimalsTab
