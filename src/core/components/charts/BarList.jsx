// Barras horizontais com o valor na ponta. `note` vai ao lado do valor (ex.: %).
// Uma grade só para a lista inteira: a coluna dos rótulos tem a largura do
// maior, e todas as barras partem da mesma linha. A barra para 4.5rem antes
// do fim, que é o espaço do valor da maior. No celular o rótulo sobe para
// cima da barra, senão ela some de tão curta
function BarList({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <ul className="grid grid-cols-1 items-center gap-x-3 gap-y-1 sm:grid-cols-[max-content_1fr] sm:gap-y-3">
      {items.map((item, index) => (
        <li key={item.key} className="contents">
          <span className={`text-xs font-semibold text-slate-600 ${index > 0 ? 'mt-2 sm:mt-0' : ''}`}>{item.label}</span>
          <span className="flex items-center gap-2">
            {item.value > 0 && (
              <span
                aria-hidden="true"
                className={`h-2.5 min-w-1 shrink-0 rounded-r ${item.colorClass}`}
                style={{ width: `calc((100% - 4.5rem) * ${item.value / max})` }}
              />
            )}
            <span className="whitespace-nowrap text-xs font-bold text-emerald-950">
              {item.value}
              {item.note && <span className="font-normal text-slate-400"> · {item.note}</span>}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export default BarList
