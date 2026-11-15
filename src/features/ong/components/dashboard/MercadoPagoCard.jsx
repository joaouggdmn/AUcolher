import { useState } from 'react'
import { SiMercadopago } from 'react-icons/si'
import { FaArrowsRotate, FaCircleCheck, FaLinkSlash, FaTriangleExclamation } from 'react-icons/fa6'
import ConfirmDialog from '../../../../core/components/ui/ConfirmDialog'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { formatDateBr } from '../../../../core/utils/formatDate'
import {
  useConnectMercadoPago,
  useDisconnectMercadoPago,
  useMercadoPagoAccount,
} from '../../../doacoes/hooks/useMercadoPagoAccount'

const BUTTON_CLASSES =
  'flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300 disabled:cursor-wait disabled:opacity-70'

const TONES = {
  neutral: 'border-slate-200 bg-slate-50',
  connected: 'border-emerald-100 bg-emerald-50/60',
  warning: 'border-amber-200 bg-amber-50',
}

function Frame({ tone, className, children }) {
  return (
    <section
      aria-label="Conta do Mercado Pago"
      className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:p-5 ${TONES[tone]} ${className}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
        <SiMercadopago size={24} />
      </span>
      {children}
    </section>
  )
}

// Conta do Mercado Pago da ONG: é nela que caem os PIX das campanhas. Fica no
// topo das campanhas do painel e no lugar do formulário de criar campanha
// enquanto não há conta conectada. `feedback`: aviso da volta do Mercado Pago
// que não deu certo (cancelada, conta de outra ONG, erro); `onNotify`: toast
function MercadoPagoCard({ feedback = null, onNotify, className = '' }) {
  const account = useMercadoPagoAccount()
  const connect = useConnectMercadoPago()
  const disconnect = useDisconnectMercadoPago()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (account.isLoading) {
    return (
      <div className={`h-[5.5rem] animate-pulse rounded-2xl border border-slate-100 bg-slate-50 ${className}`}>
        <span className="sr-only">Carregando a conta do Mercado Pago</span>
      </div>
    )
  }

  if (account.error) {
    return (
      <Frame tone="neutral" className={className}>
        <p className="min-w-0 flex-1 text-sm text-slate-600">
          Não foi possível ver a situação da sua conta do Mercado Pago. {getErrorMessage(account.error)}
        </p>
        <button
          type="button"
          onClick={() => account.refetch()}
          className={`${BUTTON_CLASSES} border border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}
        >
          <FaArrowsRotate size={11} />
          Tentar de novo
        </button>
      </Frame>
    )
  }

  // Só conta de ONG pergunta pela conta
  if (!account.data) return null

  const { isConnected, needsReconnect, isLiveMode, connectedAt } = account.data

  if (isConnected) {
    return (
      <Frame tone="connected" className={className}>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-emerald-950">
            <FaCircleCheck size={13} className="text-emerald-600" />
            Conta do Mercado Pago conectada
            {isLiveMode === false && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700">Conta de teste</span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            As doações por PIX caem direto na conta da ONG.
            {connectedAt && ` Conectada em ${formatDateBr(connectedAt)}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          className={`${BUTTON_CLASSES} border border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}
        >
          <FaLinkSlash size={12} />
          Desconectar
        </button>

        {isConfirmOpen && (
          <ConfirmDialog
            icon={FaLinkSlash}
            variant="danger"
            title="Desconectar a conta do Mercado Pago?"
            description="Suas campanhas param de receber doações até você conectar uma conta de novo. O que já foi doado continua na conta."
            confirmLabel="Desconectar"
            processingLabel="Desconectando..."
            isProcessing={disconnect.isPending}
            error={disconnect.error ? getErrorMessage(disconnect.error) : null}
            onConfirm={() =>
              disconnect.mutate(undefined, {
                onSuccess: () => {
                  setIsConfirmOpen(false)
                  onNotify?.('Conta do Mercado Pago desconectada.')
                },
              })
            }
            onCancel={() => {
              setIsConfirmOpen(false)
              disconnect.reset()
            }}
          />
        )}
      </Frame>
    )
  }

  // Depois do sucesso a página já está indo para o Mercado Pago
  const isOpening = connect.isPending || connect.isSuccess
  const message = connect.error ? getErrorMessage(connect.error) : feedback

  return (
    <Frame tone={needsReconnect ? 'warning' : 'neutral'} className={className}>
      <div className="min-w-0 flex-1">
        {needsReconnect ? (
          <>
            <p className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
              <FaTriangleExclamation size={12} className="text-amber-600" />
              Reconecte sua conta do Mercado Pago
            </p>
            <p className="mt-1 text-xs text-amber-900/80">
              A autorização expirou ou foi revogada. Suas campanhas não recebem doações até você reconectar.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-extrabold text-emerald-950">Conecte sua conta do Mercado Pago para receber doações</p>
            <p className="mt-1 text-xs text-slate-500">
              Os PIX das suas campanhas caem direto nela, que precisa ter uma <strong>chave Pix</strong> cadastrada.
              Sem conta conectada, as campanhas não recebem doações e não dá para criar novas.
            </p>
          </>
        )}
        {message && (
          <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
            {message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => connect.mutate()}
        disabled={isOpening}
        className={`${BUTTON_CLASSES} text-white ${
          needsReconnect ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-800 hover:bg-emerald-900'
        }`}
      >
        {isOpening ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : needsReconnect ? (
          <FaArrowsRotate size={11} />
        ) : (
          <SiMercadopago size={14} />
        )}
        {isOpening ? 'Abrindo o Mercado Pago...' : needsReconnect ? 'Reconectar' : 'Conectar Mercado Pago'}
      </button>
    </Frame>
  )
}

export default MercadoPagoCard
