import { FaHeart } from 'react-icons/fa6'
import AnimalCard from '../../animais/components/AnimalCard'
import AnimalCardSkeleton from '../../animais/components/AnimalCardSkeleton'
import EmptyState from '../components/EmptyState'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import { getErrorMessage } from '../../../core/utils/apiError'
import { useFavorites } from '../../../core/context/FavoritesContext'
import { useFavoriteAnimals } from '../hooks/useFavoriteAnimals'

function FavoritosPage() {
  const { data: favoriteAnimals = [], isLoading: isLoadingList, error: listError, refetch } = useFavoriteAnimals()
  const { isFavorito, isLoadingFavoritos, favoritosError, refetchFavoritos } = useFavorites()

  // Ao desfavoritar aqui, o coração muda na hora (otimista) e o card some
  // junto, sem esperar a lista recarregar da API
  const visibleAnimals = favoriteAnimals.filter((animal) => isFavorito(animal.id))

  // O filtro acima depende dos ids: sem eles, uma lista cheia pareceria vazia.
  // Por isso o carregamento e o erro valem para as duas buscas
  const isLoading = isLoadingList || isLoadingFavoritos
  const error = listError ?? favoritosError

  const handleRetry = () => {
    refetch()
    refetchFavoritos()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-2 sm:mb-10">
        {!error && (
          <span role="status" className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-rose-500">
            <FaHeart size={12} />
            {isLoading
              ? 'Carregando seus favoritos...'
              : `${visibleAnimals.length} ${visibleAnimals.length === 1 ? 'pet salvo' : 'pets salvos'}`}
          </span>
        )}
        <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Meus favoritos</h1>
        <p className="max-w-xl text-slate-600">
          Sua lista é pessoal e privada: só você vê os pets que salvou. Volte quando quiser para dar o próximo passo.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AnimalCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <LoadErrorState
          title="Não foi possível carregar seus favoritos"
          message={getErrorMessage(error)}
          onRetry={handleRetry}
        />
      ) : visibleAnimals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritosPage
