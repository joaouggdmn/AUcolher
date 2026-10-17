import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaFlag, FaXmark } from 'react-icons/fa6'
import { getErrorMessage } from '../../../core/utils/apiError'
import TextAreaField from '../../perfil/components/account/TextAreaField'
import { useCreateReport } from '../hooks/useDenuncias'
import { getReportPayloadErrors, REPORT_DESCRIPTION_MAX_LENGTH } from '../utils/reportRules'
import ReportReasonSelect from './ReportReasonSelect'

const TITLES = { ANIMAL: 'Denunciar anúncio', USER: 'Denunciar perfil' }

// Formulário da denúncia: motivo (obrigatório) e descrição (obrigatória só em
// "Outro motivo"). Os erros de campo só aparecem depois da primeira tentativa
// de envio. Vai por portal para o <body>, como os outros modais
function ReportModal({ targetType, target, onClose, onReported }) {
  const createReport = useCreateReport()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [triedSubmit, setTriedSubmit] = useState(false)
  const isSubmitting = createReport.isPending

  // Esc fecha, menos durante o envio
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isSubmitting])

  const errors = getReportPayloadErrors({ targetType, reason, description })
  const visibleErrors = triedSubmit ? errors : {}

  function handleClose() {
    if (!isSubmitting) onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()
    setTriedSubmit(true)
    if (Object.keys(errors).length > 0) return
    createReport.mutate({ targetType, target, reason, description }, { onSuccess: onReported })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-lg animate-fade-slide-in scrollbar-soft overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-700"
        >
          <FaXmark size={16} />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <FaFlag size={16} />
          </span>
          <div className="min-w-0">
            <h3 id="report-modal-title" className="text-lg font-extrabold tracking-tight text-emerald-950">
              {TITLES[targetType]}
            </h3>
            <p className="truncate text-sm text-slate-500">{target.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
          <ReportReasonSelect
            targetType={targetType}
            value={reason}
            onChange={setReason}
            error={visibleErrors.reason}
          />

          <TextAreaField
            label={reason === 'OTHER' ? 'O que aconteceu?' : 'O que aconteceu? (opcional)'}
            value={description}
            onChange={setDescription}
            placeholder="Conte o que você viu. Detalhes ajudam a equipe a decidir."
            hint={reason === 'OTHER' ? 'Obrigatório em "Outro motivo".' : null}
            error={visibleErrors.description}
            maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
            rows={3}
          />

          <p className="text-xs leading-relaxed text-slate-400">
            Quem foi denunciado não fica sabendo quem denunciou. A equipe do AUcolher analisa cada caso.
          </p>

          {createReport.error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {getErrorMessage(createReport.error)}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isSubmitting ? 'Enviando...' : 'Enviar denúncia'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default ReportModal
