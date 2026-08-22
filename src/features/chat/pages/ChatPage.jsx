import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaComments, FaPaperPlane } from 'react-icons/fa6'

function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const conversationName = location.state?.adopterName

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      {/* Cabeçalho próprio do chat — substitui a Navbar global nesta tela */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-emerald-700"
        >
          <FaArrowLeft size={16} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white">
            {conversationName ? conversationName.charAt(0).toUpperCase() : <FaComments size={14} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-emerald-950">
              {conversationName ?? 'Central de mensagens'}
            </p>
            <p className="text-xs text-slate-400">Chat sobre a adoção</p>
          </div>
        </div>
      </header>

      {/* Área de mensagens — placeholder até o módulo de chat ser implementado */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <FaComments size={26} />
        </span>
        <div>
          <h1 className="font-serif text-xl font-bold text-emerald-950">
            {conversationName ? `Conversa com ${conversationName}` : 'Nenhuma conversa selecionada'}
          </h1>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            O módulo de mensagens está em construção. Em breve você poderá combinar todos os detalhes da adoção por aqui.
          </p>
        </div>
      </div>

      {/* Barra de input — desabilitada, só ancora o layout final */}
      <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <input
          type="text"
          disabled
          placeholder="Em breve..."
          className="min-h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400 outline-none"
        />
        <button
          type="button"
          disabled
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400"
        >
          <FaPaperPlane size={14} />
        </button>
      </div>
    </div>
  )
}

export default ChatPage