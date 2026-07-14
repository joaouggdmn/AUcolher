import { FaMagnifyingGlass, FaChevronDown, FaXmark } from 'react-icons/fa6'

const ESPECIES = [
  { value: '', label: 'Espécie' },
  { value: 'CACHORRO', label: 'Cachorro' },
  { value: 'GATO', label: 'Gato' },
]

const PORTES = [
  { value: '', label: 'Porte' },
  { value: 'PEQUENO', label: 'Pequeno' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'GRANDE', label: 'Grande' },
]

const SEXOS = [
  { value: '', label: 'Sexo' },
  { value: 'M', label: 'Macho' },
  { value: 'F', label: 'Fêmea' },
]

function FilterSelect({ value, onChange, options }) {
  const isActive = value !== ''

  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 appearance-none rounded-full border px-4 py-2.5 pr-9 text-sm font-semibold outline-none transition-all duration-300 ${
          isActive
            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FaChevronDown
        size={11}
        className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
          isActive ? 'text-emerald-600' : 'text-slate-400'
        }`}
      />
    </div>
  )
}

function AnimalFilters({ search, onSearchChange, filters, onFilterChange, onClearFilters, hasActiveFilters }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Busca */}
      <div className="relative w-full">
        <FaMagnifyingGlass
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou cidade..."
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>

      {/* Filtros rápidos — scroll horizontal no mobile (scrollbar-hide), wrap livre no desktop */}
      <div className="scrollbar-hide flex items-center gap-2.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <FilterSelect value={filters.especie} onChange={(v) => onFilterChange('especie', v)} options={ESPECIES} />
        <FilterSelect value={filters.porte} onChange={(v) => onFilterChange('porte', v)} options={PORTES} />
        <FilterSelect value={filters.sexo} onChange={(v) => onFilterChange('sexo', v)} options={SEXOS} />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-100"
          >
            <FaXmark size={13} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}

export default AnimalFilters