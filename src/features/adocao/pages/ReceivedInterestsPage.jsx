import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import { FaInbox } from 'react-icons/fa6'
import ReceivedRequestCard from '../components/ReceivedRequestCard'
import ResolvedRequestRow from '../components/ResolvedRequestRow'
import MatchCelebrationToast from '../components/MatchCelebrationToast'
import ConfirmAdoptionModal from '../components/ConfirmAdoptionModal'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useReceivedRequests } from '../../../core/hooks/useReceivedRequests'
import { useConcludeAdoption } from '../../../core/hooks/useConcludeAdoption'

function ReceivedInterestsPage() {
  const { pendingRequests, inProgressRequests, historyRequests, acceptRequest, rejectRequest } = useReceivedRequests()
  const { requestDelivery } = useConcludeAdoption()
  const navigate = useNavigate()

  const [processingId, setProcessingId] = useState(null)
  const [celebratingRequest, setCelebratingRequest] = useState(null)
  const [concludingRequest, setConcludingRequest] = useState(null)
  const [isConcluding, setIsConcluding] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const hasAnyRequest = pendingRequests.length > 0 || inProgressRequests.length > 0 || historyRequests.length > 0

  const handleAccept = async (requestId) => {
    setProcessingId(requestId)
    const request = pendingRequests.find((r) => r.id === requestId)

    await new Promise((resolve) => setTimeout(resolve, 400))

    acceptRequest(requestId)
    setProcessingId(null)
    setCelebratingRequest(request ? { name: request.adopter.name, requestId: request.id } : null)
    setTimeout(() => setCelebratingRequest(null), 6000)
  }

  const handleReject = async (requestId) => {
    setProcessingId(requestId)
    await new Promise((resolve) => setTimeout(resolve, 400))
    rejectRequest(requestId)
    setProcessingId(null)
  }

  const handleGoToChat = (request) => {
    navigate('/chat', { state: { requestId: request.id } })
  }

  const handleConfirmDeliveryRequest = async () => {
    if (!concludingRequest) return
    setIsConcluding(true)
    await new Promise((resolve) => setTimeout(resolve, 400))

    requestDelivery({
      requestId: concludingRequest.id,
      animalName: concludingRequest.animal.name,
    })

    setIsConcluding(false)
    setSuccessMessage(`Pedido enviado! Assim que ${concludingRequest.animal.name} chegar até o adotante, ele confirmará por lá. 🕒`)
    setConcludingRequest(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Interesses recebidos
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Quem quer adotar seus pets
        </h1>
        <p className="mt-1 text-slate-600">
          Avalie o perfil de cada interessado, converse pelo chat e confirme a adoção quando estiver tudo certo.
        </p>
      </header>

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
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Pedidos pendentes</h2>
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
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Em andamento</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {inProgressRequests.map((request) => (
                  <ReceivedRequestCard
                    key={request.id}
                    request={request}
                    onGoToChat={handleGoToChat}
                    onRequestDelivery={setConcludingRequest}
                  />
                ))}
              </div>
            </section>
          )}

          {historyRequests.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Histórico</h2>
              <div className="flex flex-col gap-3">
                {historyRequests.map((request) => (
                  <ResolvedRequestRow key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <MatchCelebrationToast request={celebratingRequest} onClose={() => setCelebratingRequest(null)} />
      <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />

      {concludingRequest && (
        <ConfirmAdoptionModal
          mode="request-delivery"
          animalName={concludingRequest.animal.name}
          isProcessing={isConcluding}
          onConfirm={handleConfirmDeliveryRequest}
          onCancel={() => setConcludingRequest(null)}
        />
      )}
    </div>
  )
}

export default ReceivedInterestsPage