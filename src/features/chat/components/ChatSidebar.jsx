import { LuSparkles } from 'react-icons/lu'
import ContactListItem from './ContactListItem'

function ChatSidebar({ contacts, selectedContactId, onSelectContact }) {
  const isConversationOpen = !!selectedContactId

  return (
    <aside
      className={`h-full w-full shrink-0 flex-col border-r bg-white md:flex md:w-80 lg:w-96 ${
        isConversationOpen ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="shrink-0 border-b border-slate-100 px-5 py-4">
        <h1 className="font-serif text-lg font-bold text-emerald-950">Conversas</h1>
        <p className="text-xs text-slate-400">
          {contacts.length === 0
            ? 'Nenhuma conversa liberada ainda'
            : `${contacts.length} ${contacts.length === 1 ? 'conversa liberada' : 'conversas liberadas'}`}
        </p>
      </div>

      {/* min-h-0 é essencial aqui: sem ele, este item flex tenta crescer
          para caber todo o conteúdo em vez de respeitar a altura do pai
          e ativar o scroll interno */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <LuSparkles size={20} />
            </span>
            <p className="text-sm text-slate-500">
              Quando um pedido de interesse for aceito, a conversa aparece aqui automaticamente.
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactListItem
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedContactId}
              onClick={() => onSelectContact(contact.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default ChatSidebar