import AnimalCard from './AnimalCard'
import AnimalCardSkeleton from './AnimalCardSkeleton'
import EmptyState from './EmptyState'

function AnimalsGrid({ animais, isLoading, onClearFilters }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <AnimalCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (animais.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {animais.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </div>
  )
}

export default AnimalsGrid