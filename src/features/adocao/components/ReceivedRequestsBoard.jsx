import { useCallback, useState } from 'react'
import { FaInbox } from 'react-icons/fa6'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useConcludeAdoption } from '../../../core/hooks/useConcludeAdoption'
import { useReceivedRequests } from '../../../core/hooks/useReceivedRequests'
import { animalDisplayName } from '../utils/requestAnimal'
import ConfirmAdoptionModal from './ConfirmAdoptionModal'
import MatchCelebrationToast from './MatchCelebrationToast'
import ReceivedRequestCard from './ReceivedRequestCard'
import ResolvedRequestRow from './ResolvedRequestRow'

// Pequena pausa para o clique não parecer instantâneo demais (mock)
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 400))
}

function SectionTitle({ children }) {
  return <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">{children}</h2>
}

// Os pedidos recebidos e as ações do doador: aceitar, recusar e confirmar a
// entrega. Usado em Interesses recebidos e no painel da ONG.
// `onGoToChat(requestId)` abre o chat no lugar certo de cada tela; `onNotify`
// troca o aviso de sucesso próprio pelo da tela (o painel já tem o dele)
function ReceivedRequestsBoard({ onGoToChat, onNotify }) {
  const { pendingRequests, inProgressRequests, historyRequests, acceptRequest, rejectRequest } = useReceivedRequests()
  const { requestDelivery } = useConcludeAdoption()

  const [processingId, setProcessingId] = useState(null)
  const [celebratingRequest, setCelebratingRequest] = useState(null)
  const [concludingRequest, setConcludingRequest] = useState(null)
  const [isConcluding, setIsConcluding] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), [])
  const notify = onNotify ?? setSuccessMessage

  const hasAnyRequest = pendingRequests.length > 0 || inProgressRequests.length > 0 || historyRequests.length > 0

  const handleAccept = async (requestId) => {
    setProcessingId(requestId)
    const request = pendingRequests.find((r) => r.id === requestId)
    await wait()
    acceptRequest(requestId)
    setProcessingId(null)
    setCelebratingRequest(request ? { name: request.adopter.name, requestId: request.id } : null)
    setTimeout(() => setCelebratingRequest(null), 6000)
  }

  const handleReject = async (requestId) => {
    setProcessingId(requestId)
    await wait()
    rejectRequest(requestId)
    setProcessingId(null)
  }

  const handleConfirmDeliveryRequest = async () => {
    if (!concludingRequest) return
    const animalName = animalDisplayName(concludingRequest.animal)
    setIsConcluding(true)
    await wait()
    requestDelivery({ requestId: concludingRequest.id, animalName })
    setIsConcluding(false)
    setConcludingRequest(null)
    notify(`Pedido enviado! Assim que ${animalName} chegar até o adotante, ele confirma por lá.`)
  }

  return (
    <>
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
                    onRequestDelivery={setConcludingRequest}
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

      {concludingRequest && (
        <ConfirmAdoptionModal
          mode="request-delivery"
          animalName={animalDisplayName(concludingRequest.animal)}
          isProcessing={isConcluding}
          onConfirm={handleConfirmDeliveryRequest}
          onCancel={() => setConcludingRequest(null)}
        />
      )}
    </>
  )
}

export default ReceivedRequestsBoard
