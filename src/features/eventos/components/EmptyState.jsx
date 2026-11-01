// features/eventos/components/EmptyState.jsx
import { FaCalendarDays } from 'react-icons/fa6'

// Com filtros: nada bateu com a busca. Sem filtros: não há evento agendado
function EmptyState({ hasActiveFilters, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <FaCalendarDays size={26} />
      </span>
      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-emerald-950">
          {hasActiveFilters ? 'Nenhum evento encontrado' : 'Nenhum evento agendado'}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {hasActiveFilters
            ? 'Não encontramos eventos com esses filtros. Tente ajustar a busca ou o período selecionado.'
            : 'As ONGs ainda não divulgaram os próximos eventos. Volte em breve!'}
        </p>
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}

export default EmptyState
