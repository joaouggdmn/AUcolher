import { Link } from 'react-router-dom'

const TILE_CLASSES = 'flex break-inside-avoid flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'

// Bloco de número dos painéis: ícone, valor, rótulo e uma linha de contexto.
// Com `to`, o bloco inteiro leva para a seção
function StatTile({ to, icon: Icon, value, label, caption }) {
  const content = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={15} />
      </span>
      <span className="min-w-0 max-w-full">
        <span className="block text-2xl font-black tracking-tight text-emerald-950">{value}</span>
        <span className="block text-sm font-bold leading-snug text-emerald-950">{label}</span>
        {/* No papel não há como ver o resto: a linha quebra em vez de cortar */}
        <span className="mt-0.5 block truncate text-xs text-slate-500 print:overflow-visible print:whitespace-normal">
          {caption}
        </span>
      </span>
    </>
  )

  if (!to) return <div className={TILE_CLASSES}>{content}</div>

  return (
    <Link to={to} className={`${TILE_CLASSES} transition-all duration-300 hover:border-emerald-200 hover:shadow-md`}>
      {content}
    </Link>
  )
}

export default StatTile
