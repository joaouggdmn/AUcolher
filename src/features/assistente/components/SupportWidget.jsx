import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FaCommentDots, FaPaperPlane, FaPaw, FaTrashCan, FaXmark } from 'react-icons/fa6'
import { MAX_MESSAGE_LENGTH, useAssistente } from '../hooks/useAssistente'
import AssistantText from './AssistantText'

// Telas em que o balão atrapalha: o chat (já é uma conversa), o deck do
// AUmatch (o arrastar disputa o canto no celular), o painel do admin (ele
// modera, não usa o site) e a volta do login com o Google
const HIDDEN_PREFIXES = ['/chat', '/admin', '/ong/painel/conversas', '/aumatch', '/login/google']
// Telas com a barra "alterações não salvas" no rodapé: o botão sobe
const RAISED_PATHS = ['/perfil', '/ong/painel/perfil']

const SUGGESTIONS = [
  'Como adotar um animal?',
  'Como funciona o AUmatch?',
  'Como minha ONG recebe doações?',
  'Como denunciar um anúncio?',
]

const matchesPrefix = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)

// Balão do assistente de suporte (Gemini), montado uma vez na raiz do router.
// A conversa fica no sessionStorage (useAssistente) e continua ao trocar de tela
function SupportWidget() {
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const assistant = useAssistente()
  // Estável: o painel registra o Esc e põe o foco no campo só ao abrir
  const close = useCallback(() => setIsOpen(false), [])

  if (HIDDEN_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) return null

  if (!isOpen) {
    const raised = RAISED_PATHS.includes(pathname)
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir o assistente do AUcolher"
        title="Dúvidas? Fale com o assistente"
        className={`fixed right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-800 text-white shadow-lg shadow-emerald-900/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-900 print:hidden ${
          raised ? 'bottom-24' : 'bottom-5'
        }`}
      >
        <FaCommentDots size={22} />
      </button>
    )
  }

  return <SupportPanel {...assistant} onClose={close} />
}

function SupportPanel({ messages, send, isSending, error, clear, onClose }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Sempre mostra a última mensagem (ou o "digitando")
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending, error])

  const submit = (text) => {
    if (!text.trim() || isSending) return
    setDraft('')
    send(text, { onFailed: setDraft })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(draft)
    }
  }

  return (
    <section
      role="dialog"
      aria-label="Assistente do AUcolher"
      className="fixed inset-0 z-[55] flex animate-fade-in flex-col overflow-hidden bg-stone-100 print:hidden sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[560px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[380px] sm:rounded-3xl sm:shadow-2xl sm:shadow-emerald-950/25"
    >
      <header className="flex shrink-0 items-center gap-3 bg-emerald-800 px-4 py-3 text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-emerald-950">
          <FaPaw size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black tracking-tight">Assistente AUcolher</h2>
          <p className="text-xs text-emerald-100">Tira dúvidas sobre a plataforma</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpar a conversa"
            title="Limpar a conversa"
            className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-100 transition-colors duration-300 hover:bg-emerald-700 hover:text-white"
          >
            <FaTrashCan size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar o assistente"
          className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-100 transition-colors duration-300 hover:bg-emerald-700 hover:text-white"
        >
          <FaXmark size={18} />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble role="model">
          <p>
            Oi! Sou o assistente do AUcolher. Posso explicar como adotar, como funciona o AUmatch, doações,
            eventos e a sua conta.
          </p>
        </Bubble>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                disabled={isSending}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors duration-300 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <Bubble key={message.id} role={message.role}>
            {message.role === 'model' ? <AssistantText text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}
          </Bubble>
        ))}

        {isSending && (
          <Bubble role="model">
            <span className="flex items-center gap-1 py-1" aria-label="O assistente está digitando">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2 w-2 animate-bounce rounded-full bg-emerald-600"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </Bubble>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(draft)
        }}
        className="shrink-0 border-t border-slate-200 bg-white px-3 pb-3 pt-2"
      >
        {error && (
          <p role="alert" className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="support-assistant-input" className="sr-only">
            Sua pergunta
          </label>
          <textarea
            id="support-assistant-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva sua dúvida..."
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-stone-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors duration-300 focus:border-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            aria-label="Enviar pergunta"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-emerald-950 shadow-md shadow-amber-500/30 transition-all duration-300 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <FaPaperPlane size={15} />
          </button>
        </div>
        <p className="mt-2 flex justify-between gap-2 text-[11px] leading-snug text-slate-400">
          <span>Respostas automáticas geradas por IA (Gemini), que podem conter erros. Não envie dados pessoais.</span>
          {draft.length > MAX_MESSAGE_LENGTH - 100 && (
            <span className="shrink-0 font-semibold">
              {draft.length}/{MAX_MESSAGE_LENGTH}
            </span>
          )}
        </p>
      </form>
    </section>
  )
}

function Bubble({ role, children }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-emerald-800 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default SupportWidget
