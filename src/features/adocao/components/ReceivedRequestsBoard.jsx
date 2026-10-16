import { useCallback, useState } from 'react'
import { FaInbox, FaXmark } from 'react-icons/fa6'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useConcludeAdoption } from '../../../core/hooks/useConcludeAdoption'
import { useReceivedRequests } from '../../../core/hooks/useReceivedRequests'
import { getErrorMessage } from '../../../core/utils/apiError'
import { animalDisplayName } from '../utils/requestAnimal'
import ConfirmAdoptionModal from './ConfirmAdoptionModal'
import MatchCelebrationToast from './MatchCelebrationToast'
import ReceivedRequestCard from './ReceivedRequestCard'
import ResolvedRequestRow from './ResolvedRequestRow'

function SectionTitle({ children }) {
  return <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">{children}</h2>
}

// Os pedidos recebidos e as ações do doador: aceitar, recusar, confirmar a
// entrega e desistir. Usado em Interesses recebidos e no painel da ONG.
// `onGoToChat(requestId)` abre o chat no lugar certo de cada tela; `onNotify`
// troca o aviso de sucesso próprio pelo da tela (o painel já tem o dele).
// A API valida cada ação: se ela recusar, a mensagem aparece no topo (ou no modal)
function ReceivedRequestsBoard({ onGoToChat, onNotify }) {
  const { pendingRequests, inProgressRequests, historyRequests, acceptRequest, rejectRequest } = useReceivedRequests()
  const { requestDelivery, cancelAdoption } = useConcludeAdoption()

  const [processingId, setProcessingId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [celebratingRequest, setCelebratingRequest] = useState(null)
  // { request, mode: 'request-delivery' | 'owner-withdraw' }
  const [confirming, setConfirming] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), [])
  const notify = onNotify ?? setSuccessMessage

  const hasAnyRequest = pendingRequests.length > 0 || inProgressRequests.length > 0 || historyRequests.length > 0

  async function runAction(requestId, action, fallbackMessage) {
    setProcessingId(requestId)
    setActionError(null)
    try {
      await action(requestId)
      return true
    } catch (error) {
      setActionError(getErrorMessage(error, fallbackMessage))
      return false
    } finally {
      setProcessingId(null)
    }
  }

  const handleAccept = async (requestId) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (!(await runAction(requestId, acceptRequest, 'Não foi possível aceitar o pedido.'))) return
    setCelebratingRequest(request ? { name: request.adopter.name, requestId: request.id } : null)
    setTimeout(() => setCelebratingRequest(null), 6000)
  }

  const handleReject = (requestId) => runAction(requestId, rejectRequest, 'Não foi possível recusar o pedido.')

  const openConfirm = (request, mode) => {
    setConfirmError(null)
    setConfirming({ request, mode })
  }

  const handleConfirm = async () => {
    if (!confirming) return
    const { request, mode } = confirming
    const animalName = animalDisplayName(request.animal)
    setIsConfirming(true)
    setConfirmError(null)
    try {
      if (mode === 'request-delivery') {
        await requestDelivery({ requestId: request.id })
        notify(`Pedido enviado! Assim que ${animalName} chegar até o adotante, ele confirma por lá.`)
      } else {
        await cancelAdoption({ requestId: request.id, byOwner: true, fromStatus: request.status })
        notify(`Você desistiu da adoção de ${animalName}.`)
      }
      setConfirming(null)
    } catch (error) {
      setConfirmError(getErrorMessage(error, 'Não foi possível concluir. Tente novamente.'))
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      {actionError && (
        <p
          role="alert"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {actionError}
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Fechar aviso"
            className="shrink-0 rounded-full p-1 text-rose-400 transition-colors duration-300 hover:bg-rose-100 hover:text-rose-600"
          >
            <FaXmark size={12} />
          </button>
        </p>
      )}

      {!hasAnyRequest ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FaInbox size={26} />
          </span>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-emerald-950">Nenhum pedido por aqui ainda</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Assim que alguém demonstrar interesse em um dos seus pets, o pedido aparece aqui.
            </p>
          </div>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <section className="mb-10">
              <SectionTitle>Pedidos pendentes</SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((request) => (
                  <ReceivedRequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isProcessing={processingId === request.id}
                  />
                ))}
              </div>
            </section>
          )}

          {inProgressRequests.length > 0 && (
            <section className="mb-10">
              <SectionTitle>Em andamento</SectionTitle>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {inProgressRequests.map((request) => (
                  <ReceivedRequestCard
                    key={request.id}
                    request={request}
                    onGoToChat={(chatRequest) => onGoToChat(chatRequest.id)}
                    onRequestDelivery={(chosen) => openConfirm(chosen, 'request-delivery')}
                    onWithdraw={(chosen) => openConfirm(chosen, 'owner-withdraw')}
                  />
                ))}
              </div>
            </section>
          )}

          {historyRequests.length > 0 && (
            <section>
              <SectionTitle>Histórico</SectionTitle>
              <div className="flex flex-col gap-3">
                {historyRequests.map((request) => (
                  <ResolvedRequestRow key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <MatchCelebrationToast
        request={celebratingRequest}
        onClose={() => setCelebratingRequest(null)}
        onGoToChat={onGoToChat}
      />
      {!onNotify && <SuccessToast message={successMessage} onClose={clearSuccessMessage} />}

      {confirming && (
        <ConfirmAdoptionModal
          mode={confirming.mode}
          animalName={animalDisplayName(confirming.request.animal)}
          isProcessing={isConfirming}
          error={confirmError}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(null)}
        />
      )}
    </>
  )
}

export default ReceivedRequestsBoard
