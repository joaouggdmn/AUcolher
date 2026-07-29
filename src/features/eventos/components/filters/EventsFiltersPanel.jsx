import { FaXmark } from 'react-icons/fa6'
import FilterSection from '../../../../core/components/ui/filters/FilterSection'
import CheckboxOption from '../../../../core/components/ui/filters/CheckboxOption'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { CATEGORIA_OPTIONS, PERIODO_OPTIONS, CIDADE_OPTIONS } from './filterOptions'

function EventsFiltersPanel({ filters, onToggleCategoria, onPeriodoChange, onCidadeChange, onClear, hasActiveFilters }) {
  return (
    <div className="flex flex-col">
      <FilterSection title="Categoria">
        {CATEGORIA_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.categorias.includes(opt.value)}
            onChange={() => onToggleCategoria(opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Período">
        <PillToggleGroup options={PERIODO_OPTIONS} value={filters.periodo} onChange={onPeriodoChange} />
      </FilterSection>

      <FilterSection title="Localização">
        <select
          value={filters.cidade}
          onChange={(e) => onCidadeChange(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        >
          {CIDADE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterSection>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 transition-all duration-300 hover:bg-red-100"
        >
          <FaXmark size={13} />
          Limpar todos os filtros
        </button>
      )}
    </div>
  )
}

export default EventsFiltersPanel