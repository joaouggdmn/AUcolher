// features/eventos/components/EventsGrid.jsx
import EventCard from './EventCard'
import EventCardSkeleton from './EventCardSkeleton'
import EmptyState from './EmptyState'

const SKELETON_COUNT = 6

function EventsGrid({ events, viewMode, isLoading, hasActiveFilters, onClearFilters }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
  }

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
