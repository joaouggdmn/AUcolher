function ChartCard({ title, subtitle, children }) {
  return (
    <figure className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <figcaption>
        <p className="text-sm font-extrabold tracking-tight text-emerald-950">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </figcaption>
      {children}
    </figure>
  )
}

export default ChartCard
