// features/eventos/components/EventsGrid.jsx
import EventCard from './EventCard'
import EmptyState from './EmptyState'

function EventsGrid({ events, viewMode, onClearFilters }) {
  if (events.length === 0) return <EmptyState onClearFilters={onClearFilters} />

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-5">
        {events.map((event) => (
          <EventCard key={event.id} event={event} layout="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} layout="grid" />
      ))}
    </div>
  )
}

export default EventsGrid