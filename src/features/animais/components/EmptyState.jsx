import { FaPaw } from 'react-icons/fa6'

function EmptyState({ onClearFilters }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <FaPaw size={26} />
      </span>

      <div>
        <h3 className="font-serif text-xl font-bold text-emerald-950">Nenhum animal encontrado</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Não encontramos pets com esses filtros. Tente ajustar a busca ou limpar os filtros aplicados.
        </p>
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        className="mt-2 rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
      >
        Limpar filtros
      </button>
    </div>
  )
}

export default EmptyState