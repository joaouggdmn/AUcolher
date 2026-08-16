import { useLocation } from 'react-router-dom'
import { FaComments } from 'react-icons/fa6'

function ChatPage() {
  const location = useLocation()
  const adopterName = location.state?.adopterName

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 pb-20 pt-32 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <FaComments size={26} />
      </span>
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald-950">
          {adopterName ? `Conversa com ${adopterName}` : 'Central de mensagens'}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          O módulo de chat está em construção. Em breve você poderá combinar todos os detalhes da adoção por aqui.
        </p>
      </div>
    </div>
  )
}

export default ChatPage