function ChartCard({ title, subtitle, children }) {
  return (
    <figure className="flex break-inside-avoid flex-col gap-4 rounded-card border border-line bg-white p-5">
      <figcaption>
        <p className="text-sm font-extrabold tracking-tight text-brand-950">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
      </figcaption>
      {children}
    </figure>
  )
}

export default ChartCard
