import { FaBan, FaPaw } from 'react-icons/fa6'

// Os passos do fechamento (e as desistências) usam o mesmo modal, só
// trocando o texto/rótulos — evita duplicar o markup do dialog para cada um
const MODE_CONTENT = {
  'request-delivery': {
    title: 'Confirmar entrega?',
    confirmLabel: 'Sim, confirmar entrega',
    getDescription: (animalName) =>
      `Confirme que ${animalName} será (ou já foi) entregue a este adotante. O chat será bloqueado para novas mensagens e o adotante precisará confirmar o recebimento para concluir a adoção.`,
  },
  conclude: {
    title: 'Confirmar chegada do pet?',
    confirmLabel: 'Sim, o pet chegou',
    getDescription: (animalName) =>
      `Confirme que ${animalName} já chegou até você. Essa ação encerra o processo de adoção e não pode ser desfeita.`,
  },
  // Dono desistindo de um pedido aceito ou aguardando entrega
  'owner-withdraw': {
    title: 'Desistir desta adoção?',
    confirmLabel: 'Sim, desistir',
    isDanger: true,
    getDescription: (animalName) =>
      `O pedido para ${animalName} será cancelado e a conversa ficará encerrada. O adotante verá que você desistiu. Essa ação não pode ser desfeita.`,
  },
  // Adotante desistindo do pedido, em qualquer etapa antes da conclusão
  'adopter-cancel': {
    title: 'Cancelar o seu pedido?',
    confirmLabel: 'Sim, cancelar pedido',
    isDanger: true,
    getDescription: (animalName) =>
      `Seu pedido para ${animalName} será cancelado e a conversa, se houver, ficará encerrada. Se mudar de ideia, você pode pedir de novo enquanto ${animalName} estiver disponível.`,
  },
}

// `error`: a mensagem da API quando a confirmação falha — o modal continua aberto
function ConfirmAdoptionModal({ mode = 'request-delivery', animalName, onConfirm, onCancel, isProcessing, error }) {
  const content = MODE_CONTENT[mode]
  const Icon = content.isDanger ? FaBan : FaPaw

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              content.isDanger ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
            }`}
          >
            <Icon size={22} />
          </span>

          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">{content.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{content.getDescription(animalName)}</p>
          </div>

          {error && (
            <p role="alert" className="w-full rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600">
              {error}
            </p>
          )}

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className={`rounded-xl py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                content.isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-800 hover:bg-emerald-900'
              }`}
            >
              {isProcessing ? 'Confirmando...' : content.confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmAdoptionModal
