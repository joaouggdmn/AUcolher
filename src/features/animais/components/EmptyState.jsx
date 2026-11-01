import { FaPaw } from 'react-icons/fa6'

function EmptyState({ onClearFilters }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-line bg-white/60 px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <FaPaw size={26} />
      </span>

      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-brand-950">Nenhum animal encontrado</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-500">
          Não encontramos pets com esses filtros. Tente ajustar a busca ou limpar os filtros aplicados.
        </p>
      </div>

      <button
        type="button"
        onClick={onClearFilters}
        className="mt-2 rounded-control bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
      >
        Limpar filtros
      </button>
    </div>
  )
}

export default EmptyState