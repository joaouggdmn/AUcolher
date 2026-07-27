import { FaChevronDown, FaXmark } from 'react-icons/fa6'
import CheckboxOption from './CheckboxOption'
import ToggleSwitch from './ToggleSwitch'
import FilterSection from './FilterSection'
import { ESPECIE_OPTIONS, PORTE_OPTIONS, SEXO_OPTIONS, IDADE_OPTIONS, CIDADE_OPTIONS } from './filterOptions'

function FiltersPanel({
  filters,
  onToggleArrayFilter,
  onToggleSpecialNeeds,
  onCidadeChange,
  onDistanceChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="flex flex-col">
      <FilterSection title="Espécie">
        {ESPECIE_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.especies.includes(opt.value)}
            onChange={() => onToggleArrayFilter('especies', opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Porte">
        {PORTE_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.portes.includes(opt.value)}
            onChange={() => onToggleArrayFilter('portes', opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Sexo">
        {SEXO_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.sexos.includes(opt.value)}
            onChange={() => onToggleArrayFilter('sexos', opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Idade">
        {IDADE_OPTIONS.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            checked={filters.idades.includes(opt.value)}
            onChange={() => onToggleArrayFilter('idades', opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Necessidades especiais">
        <ToggleSwitch
          label="Apenas pets com necessidades especiais"
          checked={filters.necessidadesEspeciais}
          onChange={onToggleSpecialNeeds}
        />
      </FilterSection>

      <FilterSection title="Cidade">
        <div className="relative">
          <select
            value={filters.cidade}
            onChange={(e) => onCidadeChange(e.target.value)}
            className="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition-all duration-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          >
            {CIDADE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={11}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </FilterSection>

      <FilterSection title="Distância máxima">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-emerald-800">Até {filters.distanciaMax} km</span>
          <input
            type="range"
            min={1}
            max={50}
            value={filters.distanciaMax}
            onChange={(e) => onDistanceChange(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-700"
          />
        </div>
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

export default FiltersPanel