import ChartTooltip from './ChartTooltip'

// Colunas de uma série só, com o valor no topo. Cada coluna reserva 1.25rem
// acima dela para esse rótulo, então a maior nunca encosta no limite
function ColumnChart({ columns, colorClass }) {
  const max = Math.max(...columns.map((column) => column.value), 0)

  return (
    <div>
      <div className="flex h-40 items-end gap-2 border-b border-slate-200">
        {columns.map((column) => (
          <div key={column.key} className="flex h-full flex-1 items-end justify-center">
            {column.value > 0 && (
              <div
                tabIndex={0}
                aria-label={`${column.detail}: ${column.valueText}`}
                style={{ height: `calc((100% - 1.25rem) * ${column.value / max})` }}
                className={`group relative min-h-1 w-full max-w-6 rounded-t outline-none transition-[filter] duration-150 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-950/30 ${colorClass}`}
              >
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-emerald-950">
                  {column.valueLabel}
                </span>
                <ChartTooltip value={column.valueText} label={column.detail} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {columns.map((column) => (
          <span key={column.key} className="flex-1 text-center text-[11px] text-slate-500">
            {column.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ColumnChart
