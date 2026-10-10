import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaBan, FaCircleCheck, FaCircleNotch, FaFlagCheckered } from 'react-icons/fa6'
import { useAuth } from '../../../core/context/AuthContext'
import { getErrorMessage } from '../../../core/utils/apiError'
import AuthRequiredModal from '../../../core/components/ui/AuthRequiredModal'
import InfoToast from '../../../core/components/ui/InfoToast'
import { useEventAttendance } from '../hooks/useEventAttendance'

const SIZES = {
  md: 'rounded-xl py-2.5 text-sm',
  lg: 'rounded-2xl py-4 text-base',
}

const TOAST_MS = 3500

// Quem já confirmou num evento lotado ainda pode cancelar
function getLockedState(event, isConfirmed) {
  if (event.isPast) return { icon: FaFlagCheckered, label: isConfirmed ? 'Você participou' : 'Evento encerrado' }
  if (event.isFull && !isConfirmed) return { icon: FaBan, label: 'Vagas esgotadas' }
  return null
}

// Botão de presença do card e do detalhe. Os estados travados (passado,
// lotado, evento da própria ONG) espelham as recusas do backend, para o
// usuário nem chegar a tentar
function AttendanceButton({ event, size = 'md', className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { isAttending, toggleAttendance, isLoading, isPending } = useEventAttendance()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const isConfirmed = isAttending(event.id)
  const isOwnEvent = user != null && String(user.id) === String(event.organizer.id)
  const sizeClasses = SIZES[size]

  if (isOwnEvent) {
    return (
      <p className={`flex items-center justify-center bg-slate-50 font-semibold text-slate-500 ${sizeClasses} ${className}`}>
        Evento da sua ONG
      </p>
    )
  }

  // Sem isso o botão nasce "Confirmar presença" / "Evento encerrado" e troca
  // de texto quando a presença da conta chega
  if (isLoading) {
    return (
      <p className={`flex items-center justify-center gap-2 bg-slate-50 font-semibold text-slate-400 ${sizeClasses} ${className}`}>
        <FaCircleNotch size={14} className="animate-spin" />
        Carregando...
      </p>
    )
  }

  const locked = getLockedState(event, isConfirmed)
  if (locked) {
    const LockedIcon = locked.icon
    return (
      <p className={`flex items-center justify-center gap-2 bg-slate-100 font-bold text-slate-500 ${sizeClasses} ${className}`}>
        <LockedIcon size={14} />
        {locked.label}
      </p>
    )
  }

  // A presença fica salva na conta e alimenta "Eventos participados" em
  // Minha conta — sem sessão não há onde guardar, então convida ao login
  const handleClick = () => {
    const started = toggleAttendance(event.id, {
      onError: (error) => {
        setErrorMessage(getErrorMessage(error))
        setTimeout(() => setErrorMessage(null), TOAST_MS)
      },
    })
    if (!started) setIsAuthModalOpen(true)
  }

  const handleGoToLogin = () => {
    setIsAuthModalOpen(false)
    navigate('/login', { state: { from: location } })
  }

  const Icon = isPending ? FaCircleNotch : FaCircleCheck

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isConfirmed}
        title={isConfirmed ? 'Clique para cancelar sua presença' : undefined}
        className={`flex items-center justify-center gap-2 font-bold transition-all duration-300 disabled:cursor-wait disabled:opacity-80 ${sizeClasses} ${
          isConfirmed
            ? 'bg-emerald-700 text-white hover:bg-emerald-800'
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white'
        } ${className}`}
      >
        <Icon size={14} className={isPending ? 'animate-spin' : ''} />
        {isConfirmed ? 'Presença confirmada' : 'Confirmar presença'}
      </button>

      {/* Portal: modal e toast são fixed e não podem herdar o transform/empilhamento do card */}
      {createPortal(
        <>
          {isAuthModalOpen && (
            <AuthRequiredModal
              message="Faça login para confirmar presença e acompanhar seus eventos na sua conta."
              onCancel={() => setIsAuthModalOpen(false)}
              onLogin={handleGoToLogin}
            />
          )}
          <InfoToast message={errorMessage} />
        </>,
        document.body
      )}
    </>
  )
}

export default AttendanceButton
