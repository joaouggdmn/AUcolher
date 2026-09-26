import { useMemo } from 'react'
import { FaHeart } from 'react-icons/fa6'
import AnimalCard from '../../animais/components/AnimalCard'
import EmptyState from '../components/EmptyState'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useFavorites } from '../../../core/context/FavoritesContext'

function FavoritosPage() {
  const { animals } = useAnimals()
  const { favoritos } = useFavorites()

  // Percorre a lista de IDs (e não a de animais) para manter a ordem de
  // "favoritado mais recente primeiro". O filter(Boolean) descarta IDs
  // órfãos — anúncio removido do mock, por exemplo
  const favoriteAnimals = useMemo(
    () => favoritos.map((id) => animals.find((animal) => String(animal.id) === id)).filter(Boolean),
    [favoritos, animals]
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-2 sm:mb-10">
        <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-rose-500">
          <FaHeart size={12} />
          {favoriteAnimals.length} {favoriteAnimals.length === 1 ? 'pet salvo' : 'pets salvos'}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Meus favoritos</h1>
        <p className="max-w-xl text-slate-600">
          Sua lista é pessoal e privada: só você vê os pets que salvou. Volte quando quiser para dar o próximo passo.
        </p>
      </header>

      {favoriteAnimals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteAnimals.map((animal) => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritosPage
