import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useChatContacts } from '../../../core/hooks/useChatContacts'
import ChatSidebar from '../components/ChatSidebar'
import ChatConversationPanel from '../components/ChatConversationPanel'
import ChatEmptyState from '../components/ChatEmptyState'

function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { contacts } = useChatContacts()

  const [selectedContactId, setSelectedContactId] = useState(
    location.state?.requestId ? `request-${location.state.requestId}` : null
  )

  const selectedContact = contacts.find((c) => c.id === selectedContactId) ?? null

  return (
    // h-screen (não h-full): ancorado direto na viewport, não depende de
    // nenhum ancestral ter altura explícita propagada corretamente
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex h-16 shrink-0 items-center border-b bg-white px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar ao sistema"
          className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-emerald-700"
        >
          <FaArrowLeft size={15} />
        </button>

        <span className="text-lg font-black leading-none tracking-tight">
          <span className="text-emerald-950">AU</span>
          <span className="text-amber-500">colher</span>
        </span>
        <span className="ml-2 hidden font-serif text-sm font-semibold text-slate-400 sm:inline">Chat</span>
      </header>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <ChatSidebar
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
        />

        <section
          className={`h-full w-full flex-col overflow-hidden bg-[#f5f3ef] md:flex md:w-auto md:flex-1 ${
            selectedContact ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedContact ? (
            <ChatConversationPanel contact={selectedContact} onBack={() => setSelectedContactId(null)} />
          ) : (
            <ChatEmptyState hasContacts={contacts.length > 0} />
          )}
        </section>
      </main>
    </div>
  )
}

export default ChatPage