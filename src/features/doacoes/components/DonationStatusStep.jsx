import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  FaCheck,
  FaCircleCheck,
  FaClockRotateLeft,
  FaHeart,
  FaLock,
  FaRegCopy,
  FaSpinner,
} from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import Spinner from '../../../core/components/ui/Spinner'
import { useDonation, useRefreshAfterApproval } from '../hooks/useDoacoes'
import { formatCountdown, useCountdown } from '../hooks/useCountdown'

function CopyPixCode({ code }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Sem permissão de área de transferência: a pessoa ainda pode selecionar o texto
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">PIX copia e cola</span>
      <div className="flex items-center gap-2 rounded-control border border-line bg-paper p-2 pl-4">
        <span className="flex-1 truncate font-mono text-xs text-ink-600" title={code}>
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex shrink-0 items-center gap-1.5 rounded-control px-3 py-2 text-xs font-bold transition-all duration-300 ${
            isCopied ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-700 hover:text-white'
          }`}
        >
          {isCopied ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
          {isCopied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

// Aguardando o pagamento: QR, copia e cola e tempo restante
function PendingPix({ donation }) {
  const secondsLeft = useCountdown(donation.pix?.expiresAt)

  if (!donation.pix) return null

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm text-ink-500">Valor da doação</p>
        <p className="text-2xl font-black text-brand-950">{formatCurrency(donation.amount)}</p>
      </div>

      <div className="mx-auto rounded-card border border-line bg-white p-3 shadow-sm">
        {donation.pix.qrCodeBase64 ? (
          <img
            src={`data:image/png;base64,${donation.pix.qrCodeBase64}`}
            alt="QR Code do PIX"
            className="h-44 w-44"
          />
        ) : (
          <QRCodeSVG value={donation.pix.qrCode} size={176} level="M" title="QR Code do PIX" />
        )}
      </div>

      <CopyPixCode code={donation.pix.qrCode} />

      <div className="flex items-center justify-center gap-2 rounded-control bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-800">
        <FaSpinner size={13} className="animate-spin" />
        {secondsLeft > 0 ? (
          <span>
            Aguardando o pagamento · expira em <span className="font-mono">{formatCountdown(secondsLeft)}</span>
          </span>
        ) : (
          <span>Conferindo o pagamento...</span>
        )}
      </div>

      <p className="text-center text-xs text-ink-500">
        Abra o app do seu banco, escolha pagar com PIX e escaneie o QR ou cole o código. Esta janela atualiza sozinha.
      </p>
    </div>
  )
}

function ResultState({ icon: Icon, tone, title, message, children }) {
  const tones = {
    success: 'bg-brand-50 text-brand-600',
    warning: 'bg-accent-50 text-accent-600',
    neutral: 'bg-sand text-ink-500',
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-4 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>
        <Icon size={26} />
      </span>
      <div>
        <h4 className="text-lg font-extrabold tracking-tight text-brand-950">{title}</h4>
        <p className="mt-1 text-sm text-ink-500">{message}</p>
      </div>
      <div className="mt-1 flex w-full flex-col gap-2">{children}</div>
    </div>
  )
}

const primaryButton =
  'rounded-control bg-brand-700 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-800'
const secondaryButton =
  'rounded-control py-3 text-sm font-semibold text-ink-500 transition-colors duration-300 hover:bg-paper'

// Passo 2 do modal: acompanha a doação até um status final. O polling de
// useDonation para sozinho quando sai de PENDING
function DonationStatusStep({ donationId, onRetry, onClose }) {
  const { data: donation, isLoading, isError, error, refetch } = useDonation(donationId)
  const refreshAfterApproval = useRefreshAfterApproval()
  const status = donation?.status

  // Aprovou: a barra da campanha e "Meu impacto" buscam o novo total.
  // Sincroniza o cache com o servidor — não mexe em estado do componente
  useEffect(() => {
    if (status === 'APPROVED') refreshAfterApproval()
  }, [status, refreshAfterApproval])

  if (isLoading) {
    return (
      <div className="py-10">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <ResultState icon={FaClockRotateLeft} tone="warning" title="Não foi possível consultar o PIX" message={getErrorMessage(error)}>
        <button type="button" onClick={() => refetch()} className={primaryButton}>
          Tentar novamente
        </button>
      </ResultState>
    )
  }

  if (status === 'PENDING') return <PendingPix donation={donation} />

  if (status === 'APPROVED') {
    return (
      <ResultState
        icon={FaCircleCheck}
        tone="success"
        title="Doação confirmada!"
        message={`Recebemos seus ${formatCurrency(donation.amount)}. Obrigado por ajudar a ${donation.campaign.ngoName || 'ONG'}!`}
      >
        <p className="flex items-center justify-center gap-2 text-sm text-ink-500">
          <FaHeart size={13} className="text-danger-600" />
          A doação já aparece em "Meu impacto", na sua conta.
        </p>
        <button type="button" onClick={onClose} className={primaryButton}>
          Fechar
        </button>
      </ResultState>
    )
  }

  if (status === 'EXPIRED') {
    return (
      <ResultState
        icon={FaClockRotateLeft}
        tone="warning"
        title="O PIX expirou"
        message="O código vale por 30 minutos e não foi pago a tempo. Nenhum valor foi cobrado."
      >
        <button type="button" onClick={onRetry} className={primaryButton}>
          Gerar novo PIX
        </button>
        <button type="button" onClick={onClose} className={secondaryButton}>
          Fechar
        </button>
      </ResultState>
    )
  }

  // CANCELLED: a ONG encerrou ou excluiu a campanha antes do pagamento
  return (
    <ResultState
      icon={FaLock}
      tone="neutral"
      title="Campanha encerrada"
      message="A ONG encerrou esta campanha antes do pagamento, então o PIX foi cancelado. Nenhum valor foi cobrado."
    >
      <button type="button" onClick={onClose} className={primaryButton}>
        Fechar
      </button>
    </ResultState>
  )
}

export default DonationStatusStep
