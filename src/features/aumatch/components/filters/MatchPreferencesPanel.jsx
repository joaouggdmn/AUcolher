import { FaChevronDown, FaLocationDot, FaXmark, FaArrowRotateRight } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import { CITY_OPTIONS, MAX_DISTANCE_KM, SORT_OPTIONS } from './matchFilterOptions'

// Seção em versão escura: o painel é translúcido sobre o emerald-950, então
// os componentes claros de filtro da listagem (FilterSection/CheckboxOption)
// não têm contraste aqui
function PanelSection({ title, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-5 last:border-b-0 last:pb-0">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200/70">
        {Icon && <Icon size={12} className="text-amber-300" />}
        {title}
      </h3>
      {children}
    </div>
  )
}

const SELECT_CLASS =
  'min-h-11 w-full appearance-none rounded-xl border border-white/15 bg-emerald-950/60 px-3.5 py-2.5 pr-9 text-sm font-medium text-white outline-none transition-all duration-300 hover:border-white/25 focus:border-amber-300/60 focus:ring-4 focus:ring-amber-300/15'

// O popup do <select> nativo herda a cor do fundo do campo em alguns
// navegadores: sem isso as opções ficariam brancas sobre branco
const OPTION_CLASS = 'bg-emerald-900 text-white'

function MatchPreferencesPanel({
  filters,
  onCityChange,
  onDistanceChange,
  onSortChange,
  onClear,
  hasActiveFilters,
  onOpenQuiz,
  hasCompletedQuiz,
}) {
  // No topo do slider o raio deixa de filtrar — combina com o
  // applyMatchPreferences, que trata esse valor como "sem limite"
  const isDistanceUnlimited = filters.maxDistance >= MAX_DISTANCE_KM

  return (
    <div className="flex flex-col">
      {/* Atalho para refazer o quiz: é o que realmente move a agulha do
          percentual de match, então abre o painel */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-5">
        <button
          type="button"
          onClick={onOpenQuiz}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-extrabold text-emerald-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400"
        >
          {hasCompletedQuiz ? <FaArrowRotateRight size={13} /> : <LuSparkles size={14} />}
          {hasCompletedQuiz ? 'Ajustar meu perfil' : 'Responder o quiz'}
        </button>

        <p className="text-center text-[11px] text-emerald-100/60">
          {hasCompletedQuiz
            ? 'Refaça o quiz para recalcular seus matches.'
            : 'Responda o quiz para desbloquear o cálculo de compatibilidade.'}
        </p>
      </div>

      <PanelSection title="Localização" icon={FaLocationDot}>
        <div className="relative">
          <select
            value={filters.city}
            onChange={(event) => onCityChange(event.target.value)}
            aria-label="Filtrar por cidade"
            className={SELECT_CLASS}
          >
            {CITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className={OPTION_CLASS}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={11}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/70"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="aumatch-radius" className="text-sm font-bold text-white">
              {isDistanceUnlimited ? 'Qualquer distância' : `Raio de até ${filters.maxDistance} km`}
            </label>
            {isDistanceUnlimited && (
              <span className="text-[11px] font-semibold text-emerald-200/60">arraste para limitar</span>
            )}
          </div>

          <input
            id="aumatch-radius"
            type="range"
            min={1}
            max={MAX_DISTANCE_KM}
            value={filters.maxDistance}
            onChange={(event) => onDistanceChange(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-400"
          />
        </div>
      </PanelSection>

      <PanelSection title="Ordenar matches" icon={LuSparkles}>
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label="Ordenar matches"
            className={SELECT_CLASS}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className={OPTION_CLASS}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={11}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/70"
          />
        </div>
      </PanelSection>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 flex items-center justify-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/15 py-2.5 text-sm font-bold text-rose-200 transition-all duration-300 hover:bg-rose-500/25"
        >
          <FaXmark size={13} />
          Limpar preferências
        </button>
      )}
    </div>
  )
}

export default MatchPreferencesPanel
