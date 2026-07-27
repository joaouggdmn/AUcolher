import { FaMagnifyingGlass } from 'react-icons/fa6'

function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <FaMagnifyingGlass
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome ou cidade..."
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
      />
    </div>
  )
}

export default SearchBar