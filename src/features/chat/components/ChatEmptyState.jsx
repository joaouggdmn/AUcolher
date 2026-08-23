import { LuSparkles } from 'react-icons/lu'

function ChatEmptyState({ hasContacts }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <LuSparkles size={26} />
      </span>
      <div>
        <h2 className="font-serif text-xl font-bold text-emerald-950">
          {hasContacts ? 'Selecione uma conversa para começar' : 'Nenhuma conversa por aqui ainda'}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {hasContacts
            ? 'Escolha um contato ao lado para ver o histórico da conversa.'
            : 'Assim que um pedido de interesse for aceito, o chat com a outra pessoa aparece automaticamente aqui.'}
        </p>
      </div>
    </div>
  )
}

export default ChatEmptyState