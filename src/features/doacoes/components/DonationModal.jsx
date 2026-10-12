import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaXmark } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import DonationForm from './DonationForm'
import DonationStatusStep from './DonationStatusStep'

// Doação por PIX em etapas, todas derivadas do estado (sem effect trocando
// de passo): sem login → convite; sem doação → valor; com doação → status
// (QR e polling enquanto PENDING, depois sucesso / expirado / cancelado).
// Vai por portal para o <body>: aberto de dentro de uma aba animada
// (transform), o `fixed` ficaria preso a ela em vez de cobrir a tela
function DonationModal({ campaign, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [donationId, setDonationId] = useState(null)
  // Valor da última tentativa: "Gerar novo PIX" volta com ele preenchido
  const [lastAmount, setLastAmount] = useState(null)

  // Fecha com Esc — pequeno cuidado de acessibilidade
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!campaign) return null

  if (!user) {
    return createPortal(
      <AuthRequiredModal
        message="Para doar, entre na sua conta: assim a doação fica registrada no seu histórico."
        onCancel={onClose}
        onLogin={() => navigate('/login', { state: { from: location } })}
      />,
      document.body
    )
  }

  const handleCreated = (id, amount) => {
    setLastAmount(amount)
    setDonationId(id)
  }

  return createPortal(
    // z-[100] garante prioridade sobre a Navbar (z-50) e qualquer card elevado (z-30)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-md animate-fade-slide-in overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-1 px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Você está ajudando</span>
          <h3 id="donation-modal-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-500">{campaign.ong.name}</p>
        </div>

        {donationId == null ? (
          <DonationForm campaign={campaign} initialAmount={lastAmount} onCreated={handleCreated} />
        ) : (
          <DonationStatusStep donationId={donationId} onRetry={() => setDonationId(null)} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body
  )
}

export default DonationModal
