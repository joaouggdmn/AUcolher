function formatDate(date) {
  // 'YYYY-MM-DD' vira meia-noite local; datas com hora (adoção, doação) vão direto
  const parsed = date.length === 10 ? new Date(`${date}T00:00:00`) : new Date(date)
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Linha do tempo vertical. Cada item traz o próprio ícone e cor; `highlight`
// é um valor (ex.: em reais) mostrado em destaque ao lado da data
function Timeline({ items }) {
  return (
    <div className="relative flex flex-col gap-6 pl-2">
      <div className="pointer-events-none absolute bottom-2 left-[19px] top-2 w-0 border-l-2 border-dashed border-emerald-200" />

      {items.map(({ id, icon: Icon, iconClassName, title, subtitle, date, highlight }) => (
        <div key={id} className="relative flex items-start gap-4">
          <span
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md ${iconClassName}`}
          >
            <Icon size={15} />
          </span>
          <div className="min-w-0 flex-1 pt-1.5">
            <p className="text-sm font-bold text-emerald-950">{title}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>{formatDate(date)}</span>
              {highlight && <span className="font-bold text-amber-600">{highlight}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Timeline
