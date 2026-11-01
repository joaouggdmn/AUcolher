import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaXmark, FaLocationDot, FaDna, FaVenus, FaMars, FaShieldHalved, FaArrowRight, FaPaw } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'

function PetDetailModal({ pet, onClose }) {
  const { user } = useAuth()

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!pet) return null

  const isFemale = pet.sex === 'FEMALE'
  const isNgo = pet.listingType === 'NGO'
  const isOwner = !!user && user.id === pet.ownerId

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[85vh] w-full max-w-md animate-fade-slide-in scrollbar-soft overflow-y-auto rounded-modal bg-white shadow-modal">
        <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-500 shadow-md transition-colors duration-300 hover:bg-white">
          <FaXmark size={16} />
        </button>

        <div className="relative h-64 w-full overflow-hidden">
          <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
          <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
            {isNgo && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1.5 text-xs font-extrabold text-brand-950 shadow-lg ">
                <FaShieldHalved size={12} />
                ONG Verificada
              </span>
            )}
            {isOwner && (
              <span className="flex items-center gap-1.5 rounded-full bg-ink-900/85 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                <FaPaw size={11} className="text-accent-300" />
                Seu Pet
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-brand-950">{pet.name}</h2>
              <p className="text-sm text-ink-500">{pet.ageLabel}</p>
            </div>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isFemale ? 'bg-danger-50 text-danger-600' : 'bg-brand-50 text-brand-400'}`}>
              {isFemale ? <FaVenus size={14} /> : <FaMars size={14} />}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="flex items-center gap-1.5"><FaDna size={12} className="text-brand-600" />{pet.breed}</span>
            <span className="flex items-center gap-1.5"><FaLocationDot size={12} className="text-brand-600" />{pet.city}, {pet.state}</span>
          </div>

          <p className="text-sm leading-relaxed text-ink-600 break-words">{pet.summary}</p>

          {isNgo && pet.organizationName && (
            <p className="text-xs font-semibold text-accent-600">Anunciado por {pet.organizationName}</p>
          )}

          {isOwner ? (
            <p className="mt-2 rounded-control bg-paper px-4 py-3 text-center text-sm font-semibold text-ink-500">
              Este é um dos seus animais cadastrados.
            </p>
          ) : (
            // 🆕 "Ver anúncio": apenas navegação, sem NENHUM efeito colateral
            // de match/interesse. O registro real de interesse (curtir) já
            // acontece exclusivamente no botão de coração do card de swipe —
            // este link só leva à página de detalhes para o usuário
            // conferir mais informações antes de decidir.
            <Link
              to={`/animais/${pet.id}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-control bg-brand-700 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800"
            >
              Ver anúncio
              <FaArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default PetDetailModal