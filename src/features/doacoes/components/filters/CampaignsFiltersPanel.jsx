import { FaXmark } from 'react-icons/fa6'
import FilterSection from '../../../../core/components/ui/filters/FilterSection'
import CheckboxOption from '../../../../core/components/ui/filters/CheckboxOption'
import { CATEGORIA_OPTIONS, STATUS_OPTIONS } from './filterOptions'

function CampaignsFiltersPanel({ filters, onToggleCategoria, onToggleStatus, onClear, hasActiveFilters }) {
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

      <FilterSection title="Status">
        {STATUS_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.status.includes(opt.value)}
            onChange={() => onToggleStatus(opt.value)}
          />
        ))}
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

export default CampaignsFiltersPanel