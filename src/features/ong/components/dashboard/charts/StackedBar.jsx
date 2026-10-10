import ChartTooltip from './ChartTooltip'

// Parte do todo numa barra só. Os segmentos se separam por 2px de fundo (não
// por borda) e a legenda traz os números, então a cor nunca é o único sinal
function StackedBar({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 gap-0.5">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => {
            const share = `${Math.round((segment.value / total) * 100)}%`
            return (
              <div
                key={segment.key}
                tabIndex={0}
                aria-label={`${segment.label}: ${segment.value} (${share})`}
                style={{ flexGrow: segment.value }}
                className={`group relative min-w-1 basis-0 outline-none transition-[filter] duration-150 first:rounded-l last:rounded-r hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-950/30 ${segment.colorClass}`}
              >
                <ChartTooltip value={`${segment.value} · ${share}`} label={segment.label} />
              </div>
            )
          })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${segment.colorClass}`} />
            {segment.label}
            <span className={`font-bold ${segment.value > 0 ? 'text-emerald-950' : 'text-slate-400'}`}>{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StackedBar
