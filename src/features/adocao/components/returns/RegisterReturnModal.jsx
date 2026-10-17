import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FaRotateLeft } from 'react-icons/fa6'
import { useAdoptionRequests } from '../../../../core/context/AdoptionRequestContext'
import { getErrorMessage } from '../../../../core/utils/apiError'
import { todayLocalIso } from '../../../../core/utils/localDate'
import FormField from '../../../../core/components/ui/FormField'
import { animalDisplayName } from '../../utils/requestAnimal'
import { isReturnReasonValid } from '../../utils/requestStatus'
import ReturnReasonFields from './ReturnReasonFields'

// "Animal retornado" (doador): data, motivo e observação. Num pedido já
// RETURNED, a mesma modal corrige o registro (não existe desfazer). Vai por
// portal, como o ConfirmDialog, para cobrir a tela de dentro de qualquer lista
function RegisterReturnModal({ request, onClose, onRegistered }) {
  const { registerReturn } = useAdoptionRequests()
  const isCorrection = request.status === 'RETURNED'
  const animalName = animalDisplayName(request.animal)
  const today = todayLocalIso()
  const concludedOn = request.concludedAt?.slice(0, 10) ?? undefined

  const [returnDate, setReturnDate] = useState(request.returnInfo?.date ?? today)
  const [fields, setFields] = useState({
    reason: request.returnInfo?.reason ?? '',
    note: request.returnInfo?.note ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = Boolean(returnDate) && isReturnReasonValid(fields) && !isSaving

  const handleClose = () => {
    if (!isSaving) onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await registerReturn(request.id, { returnDate, ...fields })
      onRegistered(updated, { isCorrection })
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Não foi possível registrar o retorno.'))
      setIsSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-return-title"
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md animate-fade-slide-in flex-col scrollbar-soft overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <FaRotateLeft size={20} />
          </span>
          <div>
            <h3 id="register-return-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              {isCorrection ? `Corrigir o retorno de ${animalName}` : `${animalName} voltou para você?`}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              {isCorrection
                ? 'Ajuste a data, o motivo ou a observação. O retorno em si não pode ser desfeito.'
                : `A adoção por ${request.adopter.name} fica registrada como devolvida e o anúncio volta para você fora do ar. Isso ajuda a medir a taxa de reabandono da AUcolher.`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <FormField
            label="Data do retorno"
            type="date"
            value={returnDate}
            min={concludedOn}
            max={today}
            onChange={(event) => setReturnDate(event.target.value)}
            required
          />
          <ReturnReasonFields
            reason={fields.reason}
            note={fields.note}
            onChange={setFields}
            idPrefix={`return-${request.id}`}
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {isSaving ? 'Salvando...' : isCorrection ? 'Salvar correção' : 'Registrar retorno'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-xl py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

export default RegisterReturnModal
