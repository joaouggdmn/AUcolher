// features/eventos/components/EventsControlBar.jsx
import { FaMagnifyingGlass, FaTableCellsLarge, FaBars } from 'react-icons/fa6'

function EventsControlBar({ search, onSearchChange, viewMode, onViewModeChange }) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="relative flex-1">
        <FaMagnifyingGlass
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
          size={17}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar evento por nome ou cidade..."
          className="h-12 w-full rounded-card border border-line bg-white pl-11 pr-4 text-sm text-ink-900 shadow-sm outline-none transition-all duration-300 placeholder:text-ink-500 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
        />
      </div>

      {/* View toggler — controla o estado que o EventsGrid usa para decidir grid vs. lista */}
      <div className="hidden shrink-0 items-center gap-1 rounded-card border border-line bg-white p-1 shadow-sm sm:flex">
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          aria-label="Visualização em grade"
          className={`flex h-9 w-9 items-center justify-center rounded-control transition-all duration-300 ${
            viewMode === 'grid' ? 'bg-brand-700 text-white' : 'text-ink-500 hover:text-brand-600'
          }`}
        >
          <FaTableCellsLarge size={14} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          aria-label="Visualização em lista"
          className={`flex h-9 w-9 items-center justify-center rounded-control transition-all duration-300 ${
            viewMode === 'list' ? 'bg-brand-700 text-white' : 'text-ink-500 hover:text-brand-600'
          }`}
        >
          <FaBars size={14} />
        </button>
      </div>
    </div>
  )
}

export default EventsControlBar