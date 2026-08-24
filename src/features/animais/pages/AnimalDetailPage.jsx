import { useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { FaVenus, FaMars, FaLocationDot, FaRulerVertical, FaCakeCandles, FaHeart, FaShieldHalved, FaCircleCheck } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { useAnimals } from '../../../core/context/AnimalContext'
import { useAdoptionRequests } from '../../../core/context/AdoptionRequestContext'
import { useProfileCompletion } from '../../../core/hooks/useProfileCompletion'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import PhotoGallery from '../components/PhotoGallery'
import HealthBadges from '../components/HealthBadges'
import InterestInfoBubble from '../components/InterestInfoBubble'
import { buildAdopterSnapshot } from '../../adocao/utils/buildAdopterSnapshot'
import BehaviorProfile from '../components/BehaviorProfile'

const SIZE_LABELS = { SMALL: 'Pequeno', MEDIUM: 'Médio', LARGE: 'Grande' }

function AnimalDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { animals } = useAnimals()
  const { requests, createRequest } = useAdoptionRequests()
  const { percentage: profileCompletion } = useProfileCompletion(user)

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState(
    location.state?.justCreated ? 'Pet cadastrado com sucesso! 🎉' : null
  )

  const animal = animals.find((item) => String(item.id) === id)

  if (!animal) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-32 text-center">
        <h1 className="font-serif text-2xl font-bold text-emerald-950">Animal não encontrado</h1>
        <p className="mt-2 text-slate-500">Esse anúncio pode ter sido removido ou o link está incorreto.</p>
        <Link
          to="/animais"
          className="mt-6 inline-block rounded-full bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          Ver outros animais
        </Link>
      </div>
    )
  }

  const isFemale = animal.sex === 'F'
  const isNgo = animal.listingType === 'NGO'
  const isOwner = isAuthenticated && animal.ownerId === user?.id

  // Evita pedidos duplicados enquanto testamos o fluxo com contas reais
  const alreadyRequested =
    isAuthenticated &&
    requests.some((r) => r.animalId === animal.id && r.adopter?.userId === user.id && r.status !== 'REJECTED')

  const handleInterestClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }

    createRequest({
      animalId: animal.id,
      ownerId: animal.ownerId,
      adopter: buildAdopterSnapshot(user, profileCompletion),
    })

    setSuccessMessage('Pedido enviado com sucesso! Aguarde a avaliação da ONG/Protetor.')
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div className="lg:sticky lg:top-28">
          <PhotoGallery images={animal.images} animalName={animal.name} isNgo={isNgo} />
        </div>

        <div className="flex flex-col gap-6">
          <header>
            <h1 className="font-serif text-3xl font-black text-emerald-950 sm:text-4xl">{animal.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-slate-500">
              {animal.breed}
              <span className="text-slate-300">·</span>
              <FaLocationDot size={12} className="text-emerald-600" />
              {animal.city}, {animal.state}
            </p>
          </header>

          <div className="flex flex-wrap gap-2.5">
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <FaCakeCandles size={13} />
              {animal.ageLabel}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              {isFemale ? <FaVenus size={13} /> : <FaMars size={13} />}
              {isFemale ? 'Fêmea' : 'Macho'}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <FaRulerVertical size={13} />
              Porte {SIZE_LABELS[animal.size]}
            </span>
          </div>

          {isNgo && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <FaShieldHalved size={13} />
              Anunciado por {animal.organizationName}
            </p>
          )}

          <HealthBadges animal={animal} />
          <BehaviorProfile animal={animal} />

          <div>
            <h2 className="font-serif text-lg font-bold text-emerald-950">História</h2>
            <p className="mt-2 leading-relaxed text-slate-600 break-words">{animal.story}</p>
          </div>

          <div className="mt-2 flex flex-col gap-3">
            {isOwner ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                Este é um dos seus animais cadastrados.
              </p>
            ) : (
              <>
                <InterestInfoBubble />

                <button
                  type="button"
                  onClick={handleInterestClick}
                  disabled={alreadyRequested}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-extrabold shadow-lg transition-all duration-300 ${
                    alreadyRequested
                      ? 'cursor-not-allowed bg-emerald-50 text-emerald-700'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 shadow-amber-500/30 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40'
                  }`}
                >
                  {alreadyRequested ? <FaCircleCheck size={16} /> : <FaHeart size={16} />}
                  {alreadyRequested ? 'Pedido já enviado' : 'Enviar Pedido de Interesse'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthRequiredModal
          message={`Para demonstrar interesse no ${animal.name}, você precisa estar conectado à sua conta.`}
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleGoToLogin}
        />
      )}

      <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
    </div>
  )
}

export default AnimalDetailsPage