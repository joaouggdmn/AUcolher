import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import AuthRequiredModal from './AuthRequiredModal'

// Botão único de favoritar, usado hoje no card do animal e pronto para a
// página de detalhe: concentra a checagem de sessão, o convite de login e
// os rótulos de acessibilidade em um só lugar
function FavoriteButton({ animalId, animalName, className = '', iconSize = 15 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { isFavorito, toggleFavorito } = useFavorites()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const isFavorited = isFavorito(animalId)
  const label = isFavorited ? `Remover ${animalName} dos favoritos` : `Salvar ${animalName} nos favoritos`

  const handleClick = (event) => {
    // O botão costuma ficar sobre uma <Link> (imagem do card): sem isso o
    // clique no coração também navegaria para o detalhe do animal
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }

    toggleFavorito(animalId)
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isFavorited}
        aria-label={label}
        title={label}
        className={`flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
          isFavorited
            ? 'bg-white text-rose-500 shadow-md shadow-rose-500/20'
            : 'bg-white/90 text-slate-400 hover:text-rose-500'
        } ${className}`}
      >
        {isFavorited ? <FaHeart size={iconSize} /> : <FaRegHeart size={iconSize} />}
      </button>

      {/* Portal: o card tem overflow-hidden e ganha translate no hover, o
          que transformaria o fixed do modal em posição relativa ao card */}
      {isAuthModalOpen &&
        createPortal(
          <AuthRequiredModal
            message="Faça login para salvar seus pets favoritos e acompanhar quem você amou!"
            onCancel={() => setIsAuthModalOpen(false)}
            onLogin={handleGoToLogin}
          />,
          document.body
        )}
    </>
  )
}

export default FavoriteButton
