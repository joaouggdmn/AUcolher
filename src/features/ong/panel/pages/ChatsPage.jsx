import { useSearchParams } from 'react-router-dom'
import ChatConversationPanel from '../../../chat/components/ChatConversationPanel'
import ChatEmptyState from '../../../chat/components/ChatEmptyState'
import ChatSidebar from '../../../chat/components/ChatSidebar'
import { useOngPanel } from '../useOngPanel'

// Chat embutido no painel, só com as conversas sobre os animais da ONG.
// A conversa aberta fica na URL (?conversa=<id do pedido>). Altura fixa
// (tela menos a barra do celular) para a lista e as mensagens rolarem por dentro
function ChatsPage() {
  const { dashboard } = useOngPanel()
  const [searchParams, setSearchParams] = useSearchParams()
  const contacts = dashboard.conversations
  const selectedRequestId = searchParams.get('conversa')
  const selectedContact = contacts.find((contact) => String(contact.requestId) === selectedRequestId) ?? null

  const selectContact = (contactId) => {
    const contact = contacts.find((item) => item.id === contactId)
    setSearchParams(contact ? { conversa: contact.requestId } : {}, { replace: true })
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-white lg:h-dvh">
      <ChatSidebar contacts={contacts} selectedContactId={selectedContact?.id ?? null} onSelectContact={selectContact} />
      <section
        className={`h-full w-full flex-col overflow-hidden bg-[#f5f3ef] md:flex md:w-auto md:flex-1 ${
          selectedContact ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedContact ? (
          <ChatConversationPanel contact={selectedContact} onBack={() => setSearchParams({}, { replace: true })} />
        ) : (
          <ChatEmptyState hasContacts={contacts.length > 0} />
        )}
      </section>
    </div>
  )
}

export default ChatsPage
