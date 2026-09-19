import { FaPaw } from 'react-icons/fa6'

// Os 2 passos do handshake de conclusão usam o mesmo modal, só trocando o
// texto/rótulos — evita duplicar o markup do dialog para cada passo
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
}

function ConfirmAdoptionModal({ mode = 'request-delivery', animalName, onConfirm, onCancel, isProcessing }) {
  const content = MODE_CONTENT[mode]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <FaPaw size={22} />
          </span>

          <div>
            <h3 className="font-serif text-lg font-bold text-emerald-950">{content.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{content.getDescription(animalName)}</p>
          </div>

          <div className="mt-2 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className="rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? 'Confirmando...' : content.confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmAdoptionModal
