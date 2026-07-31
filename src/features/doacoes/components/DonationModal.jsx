import { useEffect, useState } from 'react'
import { FaXmark, FaQrcode, FaRegCopy, FaCheck, FaHeart } from 'react-icons/fa6'

// 🔴 Em produção: cada ONG teria sua própria chave PIX vinda do backend (campaign.pixKey)
const PIX_KEY = 'aucolher.doacoes@pix.org.br'

function DonationModal({ campaign, onClose }) {
  const [isCopied, setIsCopied] = useState(false)

  // Fecha com Esc — pequeno cuidado de acessibilidade
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!campaign) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      console.error('Não foi possível copiar a chave PIX.')
    }
  }

  return (
    // z-[100] garante prioridade sobre a Navbar (z-50) e qualquer card elevado (z-30)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm animate-fade-slide-in rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex flex-col items-center gap-1 pr-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Você está ajudando</span>
          <h3 className="font-serif text-lg font-bold text-emerald-950">{campaign.title}</h3>
        </div>

        {/* Placeholder de QR Code — futuramente gerado dinamicamente (ex: lib qrcode.react)
            a partir da chave PIX real da ONG responsável pela campanha */}
        <div className="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <FaQrcode size={96} className="text-slate-300" />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chave PIX (aleatória)</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 pl-4">
            <span className="flex-1 truncate text-sm font-medium text-slate-700">{PIX_KEY}</span>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 ${
                isCopied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              {isCopied ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
              {isCopied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <FaHeart size={13} className="text-rose-500" />
          Cada doação, de qualquer valor, transforma uma vida. Obrigado!
        </p>
      </div>
    </div>
  )
}

export default DonationModal