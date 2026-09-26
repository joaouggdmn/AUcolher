import { FaXmark } from 'react-icons/fa6'
import MatchPreferencesPanel from './MatchPreferencesPanel'

// Mesmo painel da sidebar, em gaveta lateral — o layout de 30/70 não cabe
// em telas menores que lg. Também em vidro escuro, porque os controles do
// painel são claros e precisam de fundo escuro para ter contraste
function MatchPreferencesDrawer({ isOpen, onClose, resultsCount, ...panelProps }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-emerald-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/15 bg-emerald-950/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros e preferências"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-extrabold tracking-tight text-white">Filtros e preferências</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar filtros"
            className="flex h-9 w-9 items-center justify-center rounded-full text-emerald-100/70 transition-colors duration-300 hover:bg-white/10 hover:text-white"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <MatchPreferencesPanel {...panelProps} />
        </div>

        <div className="border-t border-white/10 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-extrabold text-emerald-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:from-amber-300 hover:to-amber-400"
          >
            Ver {resultsCount} {resultsCount === 1 ? 'pet' : 'pets'}
          </button>
        </div>
      </div>
    </>
  )
}

export default MatchPreferencesDrawer
