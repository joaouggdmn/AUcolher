// features/eventos/components/filters/EventsFiltersSidebar.jsx
import EventsFiltersPanel from './EventsFiltersPanel'

function EventsFiltersSidebar(props) {
  return (
    <aside className="hidden shrink-0 lg:block lg:w-[280px]">
      <div className="sticky top-28 rounded-card border border-line bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-extrabold tracking-tight text-brand-950">Filtros</h2>
        <p className="mb-4 text-xs text-ink-500">Encontre o evento certo para você</p>
        <EventsFiltersPanel {...props} />
      </div>
    </aside>
  )
}

export default EventsFiltersSidebar