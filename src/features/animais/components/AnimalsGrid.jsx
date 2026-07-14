import AnimalCard from './AnimalCard'
import AnimalCardSkeleton from './AnimalCardSkeleton'
import EmptyState from './EmptyState'

function AnimalsGrid({ animais, isLoading, onClearFilters }) {
  // Estado de loading — pronto para quando isLoading vier do useAnimais (TanStack Query)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <AnimalCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Estado vazio — busca/filtro sem resultados
  if (animais.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animais.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} />
      ))}
    </div>
  )
}

export default AnimalsGrid