import { useEffect } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'

const AUTO_DISMISS_MS = 3000

function SuccessToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose?.()
    }, AUTO_DISMISS_MS)

    // Limpa o timeout se a mensagem mudar antes dos 3s (evita fechar o
    // toast errado) ou se o componente desmontar antes do prazo
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[110] flex justify-center px-4">
      <div className="animate-fade-slide-in flex items-center gap-3 rounded-control bg-brand-700 px-5 py-3 text-white shadow-float ring-1 ring-brand-600">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-400 text-brand-950">
          <FaCircleCheck size={15} />
        </span>
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  )
}

export default SuccessToast