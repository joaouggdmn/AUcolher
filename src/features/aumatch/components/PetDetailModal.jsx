import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaXmark, FaLocationDot, FaDna, FaVenus, FaMars, FaShieldHalved, FaHeart } from 'react-icons/fa6'

function PetDetailModal({ pet, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!pet) return null

  const isFemale = pet.sex === 'F'
  const isNgo = pet.listingType === 'NGO'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[85vh] w-full max-w-md animate-fade-slide-in overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-md transition-colors duration-300 hover:bg-white"
        >
          <FaXmark size={16} />
        </button>

        <div className="relative h-64 w-full overflow-hidden">
          <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" />
          {isNgo && (
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30">
              <FaShieldHalved size={12} />
              ONG Verificada
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-black text-emerald-950">{pet.name}</h2>
              <p className="text-sm text-slate-500">{pet.ageLabel}</p>
            </div>
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isFemale ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'
              }`}
            >
              {isFemale ? <FaVenus size={14} /> : <FaMars size={14} />}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <FaDna size={12} className="text-emerald-600" />
              {pet.breed}
            </span>
            <span className="flex items-center gap-1.5">
              <FaLocationDot size={12} className="text-emerald-600" />
              {pet.city}, {pet.state}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">{pet.summary}</p>

          {isNgo && pet.organizationName && (
            <p className="text-xs font-semibold text-amber-600">Anunciado por {pet.organizationName}</p>
          )}

          <Link
            to={`/adotar/${pet.id}`}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
          >
            <FaHeart size={14} />
            Tenho interesse em adotar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PetDetailModal