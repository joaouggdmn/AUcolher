import { RETURN_NOTE_MAX_LENGTH, RETURN_REASON_OPTIONS } from '../../utils/requestStatus'

// Motivo + observação do retorno e do repasse (regras §3.3). A observação é
// opcional, menos no "Outro motivo"
function ReturnReasonFields({ reason, note, onChange, idPrefix = 'return' }) {
  const noteRequired = reason === 'OTHER'

  return (
    <div className="flex flex-col gap-4 text-left">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold text-slate-700">Motivo</legend>
        {RETURN_REASON_OPTIONS.map((option) => {
          const checked = reason === option.value
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200 ${
                checked
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                  : 'border-slate-200 text-slate-600 hover:border-emerald-200'
              }`}
            >
              <input
                type="radio"
                name={`${idPrefix}-reason`}
                value={option.value}
                checked={checked}
                onChange={() => onChange({ reason: option.value, note })}
                className="accent-emerald-700"
              />
              {option.label}
            </label>
          )
        })}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-note`} className="text-sm font-semibold text-slate-700">
            {noteRequired ? 'Descreva o motivo' : 'Observação (opcional)'}
          </label>
          <span className="text-xs font-semibold text-slate-400">
            {note.length}/{RETURN_NOTE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id={`${idPrefix}-note`}
          value={note}
          onChange={(event) => onChange({ reason, note: event.target.value.slice(0, RETURN_NOTE_MAX_LENGTH) })}
          rows={3}
          placeholder="Ex.: não se adaptou com os dois gatos da casa."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>
    </div>
  )
}

export default ReturnReasonFields
