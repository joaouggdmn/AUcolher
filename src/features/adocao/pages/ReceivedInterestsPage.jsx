import { useNavigate } from 'react-router-dom'
import ReceivedRequestsBoard from '../components/ReceivedRequestsBoard'
import Eyebrow from '../../../core/components/ui/Eyebrow'

function ReceivedInterestsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8">
        <Eyebrow>Interesses recebidos</Eyebrow>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
          Quem quer adotar seus pets
        </h1>
        <p className="mt-1 text-slate-600">
          Avalie o perfil de cada interessado, converse pelo chat e confirme a adoção quando estiver tudo certo.
        </p>
      </header>

      <ReceivedRequestsBoard onGoToChat={(requestId) => navigate('/chat', { state: { requestId } })} />
    </div>
  )
}

export default ReceivedInterestsPage
