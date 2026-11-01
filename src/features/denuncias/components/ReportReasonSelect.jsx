import { reasonsFor } from '../utils/reportRules'

// Motivos da denúncia como uma lista de opções, cada uma com uma frase
// dizendo quando usar. Só aparecem os que valem para o alvo ("perfil falso"
// não existe num anúncio)
function ReportReasonSelect({ targetType, value, onChange, error }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-slate-700">Motivo</legend>
      {reasonsFor(targetType).map((reason) => {
        const isSelected = value === reason.value
        return (
          <label
            key={reason.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-colors duration-200 ${
              isSelected ? 'border-rose-300 bg-rose-50/70' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="report-reason"
              value={reason.value}
              checked={isSelected}
              onChange={() => onChange(reason.value)}
              className="mt-1 shrink-0 accent-rose-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-emerald-950">{reason.label}</span>
              <span className="block text-xs leading-snug text-slate-500">{reason.hint}</span>
            </span>
          </label>
        )
      })}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </fieldset>
  )
}

export default ReportReasonSelect
