// Aparece no hover e no foco do teclado da marca (que precisa da classe
// `group relative`). Só complementa: o valor também está escrito no gráfico
function ChartTooltip({ value, label }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-950 px-2.5 py-1.5 text-left text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <span className="block font-black text-white">{value}</span>
      <span className="block text-emerald-100/80">{label}</span>
    </span>
  )
}

export default ChartTooltip
