// features/eventos/components/filters/EventsFiltersDrawer.jsx
import { FaXmark } from 'react-icons/fa6'
import EventsFiltersPanel from './EventsFiltersPanel'

function EventsFiltersDrawer({ isOpen, onClose, resultsCount, ...panelProps }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-serif text-lg font-bold text-emerald-950">Filtros</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar filtros"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-1">
          <EventsFiltersPanel {...panelProps} />
        </div>

        <div className="border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-emerald-800 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-900"
          >
            Ver {resultsCount} {resultsCount === 1 ? 'evento' : 'eventos'}
          </button>
        </div>
      </div>
    </>
  )
}

export default EventsFiltersDrawer