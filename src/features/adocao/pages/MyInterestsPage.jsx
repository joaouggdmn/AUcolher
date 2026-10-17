import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaPaperPlane } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import { useConcludeAdoption } from '../../../core/hooks/useConcludeAdoption'
import { useSentRequests } from '../../../core/hooks/useSentRequests'
import { getErrorMessage } from '../../../core/utils/apiError'
import ConfirmAdoptionModal from '../components/ConfirmAdoptionModal'
import SentRequestCard from '../components/SentRequestCard'
import { animalDisplayName } from '../utils/requestAnimal'

function Section({ title, requests, onGoToChat, onCancel }) {
  if (requests.length === 0) return null
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <SentRequestCard key={request.id} request={request} onGoToChat={onGoToChat} onCancel={onCancel} />
        ))}
      </div>
    </section>
  )
}

// "Meus interesses": os pedidos que a conta enviou (pelo AUmatch ou pela
// página do animal), com a etapa de cada um e o motivo quando terminou sem
// adoção. Daqui o adotante vai para o chat ou desiste do pedido
function MyInterestsPage() {
  const navigate = useNavigate()
  const { sentRequests, activeRequests, adoptedRequests, closedRequests } = useSentRequests()
  const { cancelAdoption } = useConcludeAdoption()

  const [cancelling, setCancelling] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), [])

  const goToChat = (requestId) => navigate('/chat', { state: { requestId } })

  const openCancel = (request) => {
    setCancelError(null)
    setCancelling(request)
  }

  const handleConfirmCancel = async () => {
    const animalName = animalDisplayName(cancelling.animal)
    setIsCancelling(true)
    setCancelError(null)
    try {
      await cancelAdoption({ requestId: cancelling.id, byOwner: false, fromStatus: cancelling.status })
      setCancelling(null)
      setSuccessMessage(`Seu pedido para ${animalName} foi cancelado.`)
    } catch (error) {
      setCancelError(getErrorMessage(error, 'Não foi possível cancelar o pedido.'))
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          <LuSparkles size={15} />
          Meus interesses
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Os pets que você pediu</h1>
        <p className="mt-1 text-slate-600">
          Acompanhe cada pedido de adoção: a resposta do doador, a conversa e a entrega.
        </p>
      </header>

      {sentRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FaPaperPlane size={24} />
          </span>
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-emerald-950">Você ainda não pediu nenhum pet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Curta um pet no AUmatch ou envie um pedido pela página dele, e ele aparece aqui.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/aumatch"
              className="rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
            >
              Ir para o AUmatch
            </Link>
            <Link
              to="/animais"
              className="rounded-full border border-emerald-200 px-6 py-2.5 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-50"
            >
              Ver animais
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Section title="Em andamento" requests={activeRequests} onGoToChat={goToChat} onCancel={openCancel} />
          <Section title="Adoções concluídas" requests={adoptedRequests} onGoToChat={goToChat} onCancel={openCancel} />
          <Section title="Encerrados" requests={closedRequests} onGoToChat={goToChat} onCancel={openCancel} />
        </>
      )}

      {cancelling && (
        <ConfirmAdoptionModal
          mode="adopter-cancel"
          animalName={animalDisplayName(cancelling.animal)}
          isProcessing={isCancelling}
          error={cancelError}
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancelling(null)}
        />
      )}

      <SuccessToast message={successMessage} onClose={clearSuccessMessage} />
    </div>
  )
}

export default MyInterestsPage
