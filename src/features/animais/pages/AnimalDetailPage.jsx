import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaVenus, FaMars, FaLocationDot, FaRulerVertical, FaCakeCandles, FaHeart, FaShieldHalved } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import PhotoGallery from '../components/PhotoGallery'
import HealthBadges from '../components/HealthBadges'
import InterestInfoBubble from '../components/InterestInfoBubble'
import { mockAnimalDetails } from '../data/mockAnimalDetails'

function AnimalDetailsPage() {
  const { id } = useParams()
  const { isAuthenticated, login } = useAuth()

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  // useParams() sempre retorna string — String(item.id) garante a comparação
  // correta mesmo com ids numéricos no mock
  const animal = mockAnimalDetails.find((item) => String(item.id) === id)

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
  const isOng = animal.anunciante === 'ONG'

  const handleInteresseClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }

    // 🔴 Aqui entra a chamada real: adocaoService.createInterest(animal.id)
    setSuccessMessage('Pedido enviado com sucesso! Aguarde a avaliação da ONG/Protetor.')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleMockLogin = async () => {
    await login()
    setIsAuthModalOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

        {/* Galeria — sticky no desktop, acompanha o scroll da coluna de informações */}
        <div className="lg:sticky lg:top-28">
          <PhotoGallery images={animal.images} animalName={animal.name} isOng={isOng} />
        </div>

        {/* Informações */}
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

          {/* Tags de resumo */}
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
              Porte {animal.porte}
            </span>
          </div>

          {isOng && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <FaShieldHalved size={13} />
              Anunciado por {animal.ongName}
            </p>
          )}

          <HealthBadges animal={animal} />

          <div>
            <h2 className="font-serif text-lg font-bold text-emerald-950">História</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{animal.story}</p>
          </div>

          {/* Balão educativo + CTA — o balão fica logo acima, explicando antes do clique */}
          <div className="mt-2 flex flex-col gap-3">
            <InterestInfoBubble />

            <button
              type="button"
              onClick={handleInteresseClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-base font-extrabold text-emerald-950 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-300 hover:to-amber-400 hover:shadow-amber-500/40"
            >
              <FaHeart size={16} />
              Enviar Pedido de Interesse
            </button>
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthRequiredModal
          message={`Para demonstrar interesse no ${animal.name}, você precisa estar conectado à sua conta.`}
          onCancel={() => setIsAuthModalOpen(false)}
          onLogin={handleMockLogin}
        />
      )}

      <SuccessToast message={successMessage} />
    </div>
  )
}

export default AnimalDetailsPage