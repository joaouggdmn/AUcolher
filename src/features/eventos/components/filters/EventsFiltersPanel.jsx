import { FaXmark } from 'react-icons/fa6'
import FilterSection from '../../../../core/components/ui/filters/FilterSection'
import CheckboxOption from '../../../../core/components/ui/filters/CheckboxOption'
import PillToggleGroup from '../../../../core/components/ui/filters/PillToggleGroup'
import { CATEGORIA_OPTIONS, PERIODO_OPTIONS } from './filterOptions'

function EventsFiltersPanel({
  filters,
  cidadeOptions,
  onToggleCategoria,
  onPeriodoChange,
  onCidadeChange,
  onClear,
  hasActiveFilters,
}) {
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
          className="min-h-11 w-full rounded-control border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink-700 outline-none transition-all duration-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
        >
          {cidadeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FilterSection>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 flex items-center justify-center gap-2 rounded-full border border-danger-600/30 bg-danger-50 py-2.5 text-sm font-bold text-danger-600 transition-all duration-300 hover:bg-danger-50"
        >
          <FaXmark size={13} />
          Limpar todos os filtros
        </button>
      )}
    </div>
  )
}

export default EventsFiltersPanel