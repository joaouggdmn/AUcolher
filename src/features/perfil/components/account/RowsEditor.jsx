import { FaPlus, FaTrashCan } from 'react-icons/fa6'

// Lista editável de linhas curtas — equipe (nome + função) e horários de
// visita (dias + horário) da ONG. fields: [{ key, label, placeholder, required }]
// Linha totalmente em branco é descartada ao salvar (toOngUpdates); uma
// preenchida pela metade esbarra no `required` do campo obrigatório
function RowsEditor({ rows, onChange, fields, addLabel, emptyText, maxRows = 10 }) {
  const emptyRow = Object.fromEntries(fields.map((field) => [field.key, '']))

  const updateRow = (index, key, value) =>
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)))

  const removeRow = (index) => onChange(rows.filter((_, rowIndex) => rowIndex !== index))

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-400">
          {emptyText}
        </p>
      )}

      {rows.map((row, index) => (
        // Inputs controlados: a key por índice não embaralha valores ao remover
        <div key={index} className="flex items-end gap-2 rounded-2xl bg-slate-50 p-3 sm:gap-3">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-600">{field.label}</span>
                <input
                  value={row[field.key] ?? ''}
                  onChange={(e) => updateRow(index, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={80}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => removeRow(index)}
            aria-label={`Remover linha ${index + 1}`}
            title="Remover"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors duration-300 hover:bg-rose-50 hover:text-rose-600"
          >
            <FaTrashCan size={14} />
          </button>
        </div>
      ))}

      {rows.length < maxRows && (
        <button
          type="button"
          onClick={() => onChange([...rows, emptyRow])}
          className="flex items-center justify-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50"
        >
          <FaPlus size={12} />
          {addLabel}
        </button>
      )}
    </div>
  )
}

export default RowsEditor
