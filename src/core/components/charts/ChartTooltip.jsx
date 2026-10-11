// Mesmo escondida, a dica ocupa espaço para a rolagem: perto das bordas do
// gráfico ela se alinha pelo lado de dentro, senão vaza e cria rolagem lateral
const ALIGN_CLASSES = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
}

// Aparece no hover e no foco do teclado da marca (que precisa da classe
// `group relative`). Só complementa: o valor também está escrito no gráfico
function ChartTooltip({ value, label, align = 'center' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-emerald-950 px-2.5 py-1.5 text-left text-xs opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${ALIGN_CLASSES[align]}`}
    >
      <span className="block font-black text-white">{value}</span>
      <span className="block text-emerald-100/80">{label}</span>
    </span>
  )
}

export default ChartTooltip
