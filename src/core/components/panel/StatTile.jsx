import { Link } from 'react-router-dom'

const TILE_CLASSES = 'flex break-inside-avoid flex-col items-start gap-3 rounded-card border border-line bg-white p-4'

// Bloco de número dos painéis: ícone, valor, rótulo e uma linha de contexto.
// Com `to`, o bloco inteiro leva para a seção
function StatTile({ to, icon: Icon, value, label, caption }) {
  const content = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
        <Icon size={15} />
      </span>
      <span className="min-w-0 max-w-full">
        <span className="block text-2xl font-black tracking-tight text-brand-950">{value}</span>
        <span className="block text-sm font-bold leading-snug text-brand-950">{label}</span>
        {/* No papel não há como ver o resto: a linha quebra em vez de cortar */}
        <span className="mt-0.5 block truncate text-xs text-ink-500 print:overflow-visible print:whitespace-normal">
          {caption}
        </span>
      </span>
    </>
  )

  if (!to) return <div className={TILE_CLASSES}>{content}</div>

  return (
    <Link to={to} className={`${TILE_CLASSES} transition-colors duration-200 hover:border-brand-200`}>
      {content}
    </Link>
  )
}

export default StatTile
