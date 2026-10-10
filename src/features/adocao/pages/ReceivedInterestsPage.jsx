import { useNavigate } from 'react-router-dom'
import { LuSparkles } from 'react-icons/lu'
import ReceivedRequestsBoard from '../components/ReceivedRequestsBoard'

function ReceivedInterestsPage() {
  const navigate = useNavigate()

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

      <ReceivedRequestsBoard onGoToChat={(requestId) => navigate('/chat', { state: { requestId } })} />
    </div>
  )
}

export default ReceivedInterestsPage
