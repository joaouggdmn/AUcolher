// components/CampaignsControlBar.jsx
import { FaMagnifyingGlass } from 'react-icons/fa6'

function CampaignsControlBar({ search, onSearchChange }) {
  return (
    <div className="relative flex-1">
      <FaMagnifyingGlass
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500"
        size={17}
      />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar campanha por nome ou ONG..."
        className="h-12 w-full rounded-card border border-line bg-white pl-11 pr-4 text-sm text-ink-900 shadow-sm outline-none transition-all duration-300 placeholder:text-ink-500 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
      />
    </div>
  )
}

export default CampaignsControlBar