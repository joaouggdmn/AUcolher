import { reasonsFor } from '../utils/reportRules'

// Motivos da denúncia como uma lista de opções, cada uma com uma frase
// dizendo quando usar. Só aparecem os que valem para o alvo ("perfil falso"
// não existe num anúncio)
function ReportReasonSelect({ targetType, value, onChange, error }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-ink-700">Motivo</legend>
      {reasonsFor(targetType).map((reason) => {
        const isSelected = value === reason.value
        return (
          <label
            key={reason.value}
            className={`flex cursor-pointer items-start gap-3 rounded-control border px-3.5 py-2.5 transition-colors duration-200 ${
              isSelected ? 'border-danger-600/30 bg-danger-50/70' : 'border-line hover:border-line-strong/60 hover:bg-paper'
            }`}
          >
            <input
              type="radio"
              name="report-reason"
              value={reason.value}
              checked={isSelected}
              onChange={() => onChange(reason.value)}
              className="mt-1 shrink-0 accent-danger-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-brand-950">{reason.label}</span>
              <span className="block text-xs leading-snug text-ink-500">{reason.hint}</span>
            </span>
          </label>
        )
      })}
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </fieldset>
  )
}

export default ReportReasonSelect
