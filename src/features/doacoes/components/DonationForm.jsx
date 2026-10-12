import { useState } from 'react'
import { FaPix, FaSpinner } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import { DONATION_AMOUNT_CHIPS, DONATION_MIN_AMOUNT } from '../../../core/utils/constants'
import { formatCurrency } from '../../../core/utils/currency'
import { useCreateDonation } from '../hooks/useDoacoes'
import { getDonationAmountError } from '../utils/campanhaRules'

const CUSTOM = 'CUSTOM'

// Passo 1 do modal: escolher o valor e gerar o PIX. `initialAmount` volta
// preenchido quando a pessoa gera um novo PIX depois de um expirado
function DonationForm({ campaign, initialAmount, onCreated }) {
  const isChip = DONATION_AMOUNT_CHIPS.includes(initialAmount)
  const [choice, setChoice] = useState(initialAmount == null ? DONATION_AMOUNT_CHIPS[1] : isChip ? initialAmount : CUSTOM)
  const [customValue, setCustomValue] = useState(initialAmount != null && !isChip ? String(initialAmount) : '')
  const [touched, setTouched] = useState(false)
  const createDonation = useCreateDonation()

  const amount = choice === CUSTOM ? Number(customValue.replace(',', '.')) : choice
  const amountError = choice === CUSTOM && customValue.trim() === '' ? 'Informe o valor da doação.' : getDonationAmountError(amount)
  const showError = touched && amountError

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (amountError || createDonation.isPending) return

    createDonation.mutate(
      { campaignId: campaign.id, amount },
      { onSuccess: (donation) => onCreated(donation.id, amount) }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quanto você quer doar?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DONATION_AMOUNT_CHIPS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setChoice(value)}
              aria-pressed={choice === value}
              className={`rounded-xl border py-2.5 text-sm font-bold transition-all duration-300 ${
                choice === value
                  ? 'border-emerald-700 bg-emerald-800 text-white'
                  : 'border-slate-200 text-emerald-900 hover:border-emerald-300'
              }`}
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setChoice(CUSTOM)}
          aria-pressed={choice === CUSTOM}
          className={`mt-2 w-full rounded-xl border py-2.5 text-sm font-bold transition-all duration-300 ${
            choice === CUSTOM ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:border-emerald-300'
          }`}
        >
          Outro valor
        </button>

        {choice === CUSTOM && (
          <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-emerald-500">
            <span className="text-sm font-bold text-slate-400">R$</span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value.replace(/[^\d]/g, ''))}
              placeholder={`Mínimo ${DONATION_MIN_AMOUNT}`}
              aria-label="Valor da doação em reais"
              className="h-12 flex-1 bg-transparent text-base font-bold text-emerald-950 outline-none placeholder:font-normal placeholder:text-slate-300"
            />
          </label>
        )}

        {showError && <p className="mt-2 text-sm font-semibold text-rose-600">{amountError}</p>}
      </fieldset>

      {createDonation.isError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {getErrorMessage(createDonation.error, 'Não foi possível gerar o PIX. Tente novamente.')}
        </p>
      )}

      <button
        type="submit"
        disabled={createDonation.isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-70"
      >
        {createDonation.isPending ? <FaSpinner size={14} className="animate-spin" /> : <FaPix size={15} />}
        {createDonation.isPending ? 'Gerando PIX...' : `Doar ${amountError ? '' : formatCurrency(amount)} com PIX`}
      </button>

      <p className="text-center text-xs text-slate-400">
        Doação em reais, sem centavos. O pagamento é processado pelo Mercado Pago.
      </p>
    </form>
  )
}

export default DonationForm
