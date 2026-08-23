import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaPaperPlane, FaPaw, FaComments } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useChatMessages } from '../hooks/useChatMessages'

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function ChatConversationPanel({ contact, onBack }) {
  const { user } = useAuth()
  const { messages, sendMessage } = useChatMessages(contact.requestId)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  // Rola para a última mensagem sempre que a lista mudar — funciona tanto
  // para mensagens que EU enviei quanto para as que chegaram da outra aba
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSubmit = (e) => {
    e.preventDefault() // <form> nativo já trata Enter como submit, sem handler extra de teclado
    sendMessage(draft)
    setDraft('')
  }

  const initial = contact.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="flex h-full flex-col">
      {/* Header da conversa */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para a lista de conversas"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-emerald-700 md:hidden"
        >
          <FaArrowLeft size={15} />
        </button>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-700 text-sm font-black text-white">
          {contact.photoUrl ? (
            <img src={contact.photoUrl} alt={contact.name} className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-emerald-950">{contact.name}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
            <FaPaw size={10} className="text-amber-500" />
            Sobre {contact.animalName}
          </p>
        </div>
      </div>

      {/* Área de mensagens — min-h-0 pela mesma razão da sidebar */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
              <FaComments size={18} />
            </span>
            <p className="text-sm text-slate-500">
              Nenhuma mensagem ainda. Diga oi para {contact.name.split(' ')[0]}!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?.id
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[60%] ${
                    isMine
                      ? 'rounded-br-md bg-emerald-700 text-white'
                      : 'rounded-bl-md bg-white text-slate-700'
                  }`}
                >
                  <p className="break-words">{message.text}</p>
                  <p className={`mt-1 text-[10px] ${isMine ? 'text-emerald-100/70' : 'text-slate-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        {/* Âncora invisível — scrollIntoView mira aqui para "rolar até o fim" */}
        <div ref={bottomRef} />
      </div>

      {/* Barra de envio */}
      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t bg-white p-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="min-h-11 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Enviar mensagem"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white transition-all duration-300 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <FaPaperPlane size={14} />
        </button>
      </form>
    </div>
  )
}

export default ChatConversationPanel