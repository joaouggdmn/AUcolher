import FiltersPanel from './FiltersPanel'

function FiltersSidebar(props) {
  return (
    <aside className="hidden shrink-0 lg:block lg:w-[280px]">
      {/* top-28 posiciona a sidebar logo abaixo do navbar fixo, mesmo após rolar a página */}
      <div className="sticky top-28 rounded-card border border-line bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-extrabold tracking-tight text-brand-950">Filtros</h2>
        <p className="mb-4 text-xs text-ink-500">Refine sua busca pelo match ideal</p>
        <FiltersPanel {...props} />
      </div>
    </aside>
  )
}

export default FiltersSidebar