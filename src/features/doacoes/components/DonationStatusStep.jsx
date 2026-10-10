import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  FaCheck,
  FaCircleCheck,
  FaClockRotateLeft,
  FaFlask,
  FaHeart,
  FaLock,
  FaRegCopy,
  FaSpinner,
} from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import { formatCurrency } from '../../../core/utils/currency'
import Spinner from '../../../core/components/ui/Spinner'
import { CAN_SIMULATE_PAYMENT } from '../services/doacaoService'
import { useDonation, useRefreshAfterApproval, useSimulateDonationApproval } from '../hooks/useDoacoes'
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
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">PIX copia e cola</span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 pl-4">
        <span className="flex-1 truncate font-mono text-xs text-slate-600" title={code}>
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 ${
            isCopied ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-800 hover:text-white'
          }`}
        >
          {isCopied ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
          {isCopied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

// Aguardando o pagamento: QR, copia e cola, tempo restante e, só no modo
// teste, o botão que faz o papel do Mercado Pago aprovando
function PendingPix({ donation }) {
  const secondsLeft = useCountdown(donation.pix?.expiresAt)
  const simulate = useSimulateDonationApproval()

  if (!donation.pix) return null

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm text-slate-500">Valor da doação</p>
        <p className="text-2xl font-black text-emerald-950">{formatCurrency(donation.amount)}</p>
      </div>

      <div className="mx-auto rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
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

      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        <FaSpinner size={13} className="animate-spin" />
        {secondsLeft > 0 ? (
          <span>
            Aguardando o pagamento · expira em <span className="font-mono">{formatCountdown(secondsLeft)}</span>
          </span>
        ) : (
          <span>Conferindo o pagamento...</span>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        Abra o app do seu banco, escolha pagar com PIX e escaneie o QR ou cole o código. Esta janela atualiza sozinha.
      </p>

      {CAN_SIMULATE_PAYMENT && (
        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-3">
          <button
            type="button"
            onClick={() => simulate.mutate(donation.id)}
            disabled={simulate.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-sky-700 disabled:opacity-70"
          >
            <FaFlask size={13} />
            {simulate.isPending ? 'Aprovando...' : 'Simular pagamento (modo teste)'}
          </button>
          {simulate.isError && (
            <p className="mt-2 text-center text-xs font-semibold text-rose-600">{getErrorMessage(simulate.error)}</p>
          )}
          <p className="mt-2 text-center text-[11px] text-sky-700/80">
            Só aparece em desenvolvimento, com o mock: faz o papel do Mercado Pago confirmando o PIX.
          </p>
        </div>
      )}
    </div>
  )
}

function ResultState({ icon: Icon, tone, title, message, children }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    neutral: 'bg-slate-100 text-slate-500',
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-4 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${tones[tone]}`}>
        <Icon size={26} />
      </span>
      <div>
        <h4 className="text-lg font-extrabold tracking-tight text-emerald-950">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      <div className="mt-1 flex w-full flex-col gap-2">{children}</div>
    </div>
  )
}

const primaryButton =
  'rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900'
const secondaryButton =
  'rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50'

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
        <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <FaHeart size={13} className="text-rose-500" />
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
